import iconsData from "../simple-icons.json";

function computeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/^\./, "dot-")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
}

export function getIconDetails(iconSlug: string | null) {
  if (!iconSlug) return null;

  const slug = iconSlug.toLowerCase();

  // Aliases for known docker containers that have different names in simple-icons
  const aliases: Record<string, string> = {
    "wg-easy": "wireguard",
    adguardhome: "adguard",
    qbittorrent: "qbittorrent",
  };

  const searchSlug = aliases[slug] || slug;

  const matched = iconsData.icons.find(
    (i: any) =>
      (i.slug && i.slug === searchSlug) ||
      computeSlug(i.title) === searchSlug ||
      i.title.toLowerCase() === searchSlug,
  );

  if (matched) {
    return {
      hex: "#" + matched.hex,
      url: `https://cdn.simpleicons.org/${searchSlug}/white`,
    };
  }

  // Support for custom image URLs
  if (iconSlug.startsWith("http") || iconSlug.startsWith("/")) {
    return {
      hex: "#6B7280", // Gray fallback for custom icons
      url: iconSlug,
      isCustomUrl: true, // Flag to skip the white invert filter in UI if we want
    };
  }

  // Fallback to walkxcode/dashboard-icons for services not in simple-icons (like filebrowser)
  return {
    hex: "#6B7280",
    url: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${slug}.png`,
    isCustomUrl: true,
  };
}
