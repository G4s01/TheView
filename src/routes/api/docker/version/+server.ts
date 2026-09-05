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

export const GET: RequestHandler = async ({ url, locals }) => {
  const containerId = url.searchParams.get("containerId");
  if (!containerId) {
    return json({ error: "Missing containerId" }, { status: 400 });
  }

  // Fetch container details
  const container = await dockerRequest(`/containers/${containerId}/json`);
  if (!container) {
    return json({ error: "Container not found" }, { status: 404 });
  }

  // Extract version from labels
  const labels = container.Config?.Labels || {};
  let version = "";
  if (labels["build_version"]) {
    // linuxserver convention (often contains version-...)
    const vMatch = labels["build_version"].match(/version-([^ ]+)/);
    version = vMatch ? vMatch[1] : labels["build_version"];
  } else if (labels["org.opencontainers.image.version"]) {
    version = labels["org.opencontainers.image.version"];
  } else if (labels["version"]) {
    version = labels["version"];
  }

  if (version && version.length > 20) {
    version = version.substring(0, 20) + "..."; // prevent huge strings
  }

  const imageNameWithTag = container.Config?.Image || "";
  let updateAvailable = false;
  
  // Attempt to check for updates on Docker Hub
  if (imageNameWithTag && !imageNameWithTag.includes("ghcr.io") && !imageNameWithTag.includes("quay.io")) {
    try {
      let repo = imageNameWithTag;
      let tag = "latest";
      
      if (repo.includes(":")) {
        const parts = repo.split(":");
        repo = parts[0];
        tag = parts[1];
      }
      
      // If it's an official image like "nginx", it becomes "library/nginx"
      if (!repo.includes("/")) {
        repo = `library/${repo}`;
      }

      // We need the local image digest to compare
      const imageInfo = await dockerRequest(`/images/${imageNameWithTag}/json`);
      let localDigest = "";
      if (imageInfo && imageInfo.RepoDigests && imageInfo.RepoDigests.length > 0) {
        // e.g. "linuxserver/qbittorrent@sha256:abcd..."
        const digestPart = imageInfo.RepoDigests[0].split("@")[1];
        if (digestPart) localDigest = digestPart;
      }

      if (localDigest) {
        // Fetch remote digest from Docker Hub
        const hubRes = await fetch(`https://hub.docker.com/v2/repositories/${repo}/tags/${tag}`);
        if (hubRes.ok) {
          const hubData = await hubRes.json();
          const remoteDigest = hubData.digest;
          if (remoteDigest && remoteDigest !== localDigest) {
            updateAvailable = true;
          }
        }
      }
    } catch (e) {
      console.error("Failed to check remote update:", e);
    }
  }

  return json({
    containerId,
    version: version || "Sconosciuta",
    updateAvailable,
    image: imageNameWithTag
  });
};
