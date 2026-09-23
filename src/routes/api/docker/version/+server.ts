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

async function checkSingleImage(image: string, containers: any[]) {
  const imageInfo = await dockerRequest(`/images/${image}/json`);
  let localDigest = "";
  if (imageInfo && imageInfo.RepoDigests && imageInfo.RepoDigests.length > 0) {
    const digestPart = imageInfo.RepoDigests[0].split("@")[1];
    if (digestPart) localDigest = digestPart;
  }

  if (!localDigest) {
    return { image, updateAvailable: false, error: "Local digest not found" };
  }

  let updateAvailable = false;
  let updateUrl = "";
  let remoteDigest = "";

  let repo = image;
  let tag = "latest";

  if (repo.includes(":")) {
    const parts = repo.split(":");
    tag = parts.pop() || "latest";
    repo = parts.join(":");
  }

  let registry = "registry-1.docker.io";
  let registryPath = repo;

  if (repo.includes("/")) {
    const firstPart = repo.split("/")[0];
    if (firstPart.includes(".")) {
      registry = firstPart;
      registryPath = repo.substring(registry.length + 1);
    }
  }
  
  if (registry === "registry-1.docker.io" && !registryPath.includes("/")) {
    registryPath = `library/${registryPath}`;
  }

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

  if (!updateAvailable && containers && Array.isArray(containers)) {
    for (const c of containers) {
      if (c.Image.startsWith("sha256:")) {
        const composeImage = c.Labels?.["com.docker.compose.image"];
        if (composeImage === image) {
          updateAvailable = true;
          break;
        }
        const repoName = image.split("/").pop()?.split(":")[0];
        if (repoName && c.Names?.some((n: string) => n.includes(repoName))) {
          updateAvailable = true;
          break;
        }
      }
    }
  }

  return {
    image,
    updateAvailable,
    updateUrl,
    localDigest,
    remoteDigest,
  };
}

export const GET: RequestHandler = async ({ url }) => {
  const imageParam = url.searchParams.get("image");
  if (!imageParam) {
    return json({ error: "Missing image" }, { status: 400 });
  }

  const images = imageParam.split(",").map(img => img.trim()).filter(Boolean);
  
  // Fetch containers list once for all images to save docker socket calls
  const containers = await dockerRequest("/containers/json") || [];

  const results = await Promise.all(images.map(img => checkSingleImage(img, containers)));

  // Aggregate results: update is available if ANY image has an update
  const updateAvailable = results.some(res => res.updateAvailable);
  
  // Use the updateUrl from the first image that has an update, or fallback to the first one
  const firstUpdate = results.find(res => res.updateAvailable) || results[0];

  return json(
    {
      image: imageParam,
      updateAvailable,
      updateUrl: firstUpdate?.updateUrl || "",
      results // Include detailed results in case the client wants to know WHICH container needs an update
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
};
