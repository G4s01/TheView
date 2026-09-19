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

  // Parse tag if present
  if (repo.includes(":")) {
    const parts = repo.split(":");
    tag = parts.pop() || "latest";
    repo = parts.join(":");
  }

  let registry = "registry-1.docker.io";
  let registryPath = repo;

  // Se ha un dominio, lo estraiamo (es. ghcr.io, lscr.io, quay.io, portainer.io)
  if (repo.includes("/")) {
    const firstPart = repo.split("/")[0];
    if (firstPart.includes(".")) {
      registry = firstPart;
      registryPath = repo.substring(registry.length + 1);
    }
  }
  // Se è Docker Hub e non ha l'utente (es. ubuntu -> library/ubuntu)
  if (registry === "registry-1.docker.io" && !registryPath.includes("/")) {
    registryPath = `library/${registryPath}`;
  }

  // URL per gli esseri umani
  if (registry === "registry-1.docker.io") {
    updateUrl = `https://hub.docker.com/r/${registryPath.replace("library/", "")}`;
  } else if (registry === "ghcr.io") {
    updateUrl = `https://github.com/${registryPath.split("/")[0]}/${registryPath.split("/")[1] || registryPath}`;
  } else if (registry === "lscr.io") {
    updateUrl = `https://fleet.linuxserver.io/image?name=${registryPath.split("/")[1] || registryPath}`;
  } else {
    updateUrl = `https://${registry}/${registryPath}`;
  }

  try {
    const manifestUrl = `https://${registry}/v2/${registryPath}/manifests/${tag}`;
    let manifestRes = await fetch(manifestUrl, {
      headers: {
        Accept:
          "application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.index.v1+json",
      },
    });

    if (manifestRes.status === 401) {
      const authHeader = manifestRes.headers.get("www-authenticate");
      if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        // Parse realm="...",service="..."
        const realmMatch = authHeader.match(/realm="([^"]+)"/);
        const serviceMatch = authHeader.match(/service="([^"]+)"/);

        if (realmMatch) {
          const realm = realmMatch[1];
          let tokenUrl = `${realm}?scope=repository:${registryPath}:pull`;
          if (serviceMatch) tokenUrl += `&service=${serviceMatch[1]}`;

          const tokenRes = await fetch(tokenUrl);
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            manifestRes = await fetch(manifestUrl, {
              headers: {
                Authorization: `Bearer ${tokenData.token}`,
                Accept:
                  "application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.index.v1+json",
                "Cache-Control": "no-cache",
              },
            });
          }
        }
      }
    }

    if (manifestRes.ok) {
      remoteDigest = manifestRes.headers.get("docker-content-digest") || "";
    }
  } catch (e) {
    console.error(`Generic registry fetch error for ${registry}:`, e);
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
