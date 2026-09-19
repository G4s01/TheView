import { json } from "@sveltejs/kit";
import http from "http";
import type { RequestHandler } from "./$types";

// Helper for docker socket requests
function dockerRequest(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      socketPath: "/var/run/docker.sock",
      path,
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          resolve(null);
        } else {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(null);
          }
        }
      });
    });

    req.on("error", (e) => {
      console.error("Docker Socket error:", e.message);
      resolve(null);
    });

    req.end();
  });
}

export const GET: RequestHandler = async ({ url }) => {
  const image = url.searchParams.get("image");
  if (!image) {
    return json({ error: "Missing image" }, { status: 400 });
  }

  // We need the local image digest to compare
  const imageInfo = await dockerRequest(`/images/${image}/json`);
  let localDigest = "";
  if (imageInfo && imageInfo.RepoDigests && imageInfo.RepoDigests.length > 0) {
    // e.g. "linuxserver/qbittorrent@sha256:abcd..."
    const digestPart = imageInfo.RepoDigests[0].split("@")[1];
    if (digestPart) localDigest = digestPart;
  }

  if (!localDigest) {
    return json({ updateAvailable: false, error: "Local digest not found" });
  }

  let updateAvailable = false;
  let updateUrl = "";
  let remoteDigest = "";

  let repo = image;
  let tag = "latest";

  if (repo.includes(":")) {
    const parts = repo.split(":");
    repo = parts[0];
    tag = parts[1];
  }

  if (repo.startsWith("ghcr.io/") || repo.startsWith("lscr.io/")) {
    let ghcrRepo = repo.replace("ghcr.io/", "").replace("lscr.io/", "");
    updateUrl = repo.startsWith("lscr.io/")
      ? `https://fleet.linuxserver.io/image?name=${ghcrRepo.split("/")[1] || ghcrRepo}`
      : `https://github.com/${ghcrRepo.split("/")[0]}/${ghcrRepo.split("/")[1] || ghcrRepo}`;

    try {
      const tokenRes = await fetch(
        `https://ghcr.io/token?scope=repository:${ghcrRepo}:pull`,
      );
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        // Even for lscr.io, we can query ghcr.io directly since it's an alias
        const manifestRes = await fetch(
          `https://ghcr.io/v2/${ghcrRepo}/manifests/${tag}`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
              Accept:
                "application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.index.v1+json",
              "Cache-Control": "no-cache",
            },
          },
        );
        if (manifestRes.ok) {
          remoteDigest = manifestRes.headers.get("docker-content-digest") || "";
        }
      }
    } catch (e) {
      console.error("GHCR/lscr.io fetch error", e);
    }
  } else {
    // Docker Hub
    let dhRepo = repo;
    if (!dhRepo.includes("/")) {
      dhRepo = `library/${dhRepo}`;
    }
    updateUrl = `https://hub.docker.com/r/${dhRepo.replace("library/", "")}`;

    try {
      const tokenRes = await fetch(
        `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${dhRepo}:pull`,
      );
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const manifestRes = await fetch(
          `https://registry-1.docker.io/v2/${dhRepo}/manifests/${tag}`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
              Accept:
                "application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.index.v1+json",
              "Cache-Control": "no-cache",
            },
          },
        );
        if (manifestRes.ok) {
          remoteDigest = manifestRes.headers.get("docker-content-digest") || "";
        }
      }
    } catch (e) {
      console.error("Docker Hub fetch error", e);
    }
  }

  if (remoteDigest && remoteDigest !== localDigest) {
    updateAvailable = true;
  }

  // Check if any container is running an untagged version of this image or old digest
  if (!updateAvailable) {
    const containers = await dockerRequest("/containers/json");
    if (containers && Array.isArray(containers)) {
      for (const c of containers) {
        // If container is untagged (sha256:) and its compose image label matches OR its name resembles the image name
        if (c.Image.startsWith("sha256:")) {
          const composeImage = c.Labels?.["com.docker.compose.image"];
          if (composeImage === image) {
            updateAvailable = true;
            break;
          }
          // Fallback heuristic: if container name shares the repo name
          const repoName = image.split("/").pop()?.split(":")[0];
          if (repoName && c.Names?.some((n: string) => n.includes(repoName))) {
            updateAvailable = true;
            break;
          }
        }
      }
    }
  }

  return json(
    {
      image,
      updateAvailable,
      updateUrl,
      localDigest,
      remoteDigest,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    },
  );
};
