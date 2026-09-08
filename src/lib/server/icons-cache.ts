import fs from "fs";
import path from "path";

let cachedIcons: string[] | null = null;
const CACHE_FILE = path.join(process.cwd(), "data", "icons-cache.json");

export async function getIconsList(): Promise<string[]> {
  if (cachedIcons) return cachedIcons;

  if (fs.existsSync(CACHE_FILE)) {
    try {
      cachedIcons = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      if (cachedIcons && cachedIcons.length > 0) return cachedIcons;
    } catch (e) {
      console.error("Error reading icons cache file", e);
    }
  }

  try {
    const res = await fetch(
      "https://api.github.com/repos/homarr-labs/dashboard-icons/git/trees/main?recursive=1",
      {
        headers: {
          "User-Agent": "TheView-Dashboard",
        },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch from github");
    const data = await res.json();

    const icons = data.tree
      .filter(
        (item: any) =>
          item.path.startsWith("png/") && item.path.endsWith(".png"),
      )
      .map((item: any) => item.path.replace("png/", "").replace(".png", ""));

    cachedIcons = icons;
    try {
      fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cachedIcons));
    } catch (e) {}

    return cachedIcons || [];
  } catch (e) {
    console.error("Error fetching icons list", e);
    return [];
  }
}
