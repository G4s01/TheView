import { json } from "@sveltejs/kit";
import fs from "fs";
import path from "path";
import type { RequestHandler } from "./$types";

let cachedVersionData: any = null;
let lastFetchTime = 0;

export const GET: RequestHandler = async ({ url }) => {
  const force = url.searchParams.get("force") === "1";

  let currentVersion = "0.0.1";
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve("package.json"), "utf8"),
    );
    currentVersion = pkg.version;
  } catch (e) {}

  const now = Date.now();

  if (!force && cachedVersionData && now - lastFetchTime < 300000) {
    // 5 minutes cache
    return json({ ...cachedVersionData, currentVersion });
  }

  try {
    const res = await fetch(
      "https://api.github.com/repos/g4s01/TheView/releases/latest",
      {
        headers: { "User-Agent": "TheView-Dashboard" },
      },
    );
    if (res.ok) {
      const data = await res.json();
      cachedVersionData = {
        latestVersion: data.tag_name ? data.tag_name.replace(/^v/, "") : null,
        releaseNotes: data.body,
        url: data.html_url,
      };
      lastFetchTime = now;
    }
  } catch (e) {
    console.error("Failed to check version", e);
  }

  return json({
    currentVersion,
    latestVersion: cachedVersionData?.latestVersion,
    releaseNotes: cachedVersionData?.releaseNotes,
    url: cachedVersionData?.url,
  });
};
