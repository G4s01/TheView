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

  const matched = iconsData.icons.find(
    (i: any) =>
      (i.slug && i.slug === slug) ||
      computeSlug(i.title) === slug ||
      i.title.toLowerCase() === slug,
  );

  if (matched) {
    return {
      hex: "#" + matched.hex,
      url: `https://cdn.simpleicons.org/${slug}/white`,
    };
  }

  return null;
}
