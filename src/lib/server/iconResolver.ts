import { dashboardIcons } from "./dashboardIcons";

const aliasMap: Record<string, string> = {
  "wg-easy": "wireguard",
  "npm": "nginx-proxy-manager",
  "dockhand": "docker",
  "portainer-ce": "portainer",
  "pihole": "pi-hole",
  "theview": "svelte",
  "homeassistant": "home-assistant",
  "jellyfin": "jellyfin",
  "plex": "plex",
  "radarr": "radarr",
  "sonarr": "sonarr",
  "lidarr": "lidarr",
  "readarr": "readarr",
  "prowlarr": "prowlarr",
  "bazarr": "bazarr",
  "overseerr": "overseerr",
  "tautulli": "tautulli",
  "qbittorrent": "qbittorrent",
  "transmission": "transmission",
  "deluge": "deluge",
  "rtorrent": "rtorrent",
  "nzbget": "nzbget",
  "sabnzbd": "sabnzbd",
  "nextcloud": "nextcloud",
  "owncloud": "owncloud",
  "syncthing": "syncthing",
  "filebrowser": "filebrowser",
  "vaultwarden": "vaultwarden",
  "bitwarden": "bitwarden",
  "uptime-kuma": "uptime-kuma",
  "grafana": "grafana",
  "prometheus": "prometheus",
  "influxdb": "influxdb",
  "telegraf": "telegraf",
  "mariadb": "mariadb",
  "postgres": "postgresql",
  "postgresql": "postgresql",
  "mysql": "mysql",
  "redis": "redis",
  "mongodb": "mongodb",
  "nginx": "nginx",
  "apache": "apache",
  "traefik": "traefik",
  "caddy": "caddy",
  "authelia": "authelia",
  "authentik": "authentik",
  "keycloak": "keycloak",
  "guacamole": "apacheguacamole",
  "gitea": "gitea",
  "forgejo": "forgejo",
  "gitlab": "gitlab",
  "github": "github",
  "portainer": "portainer",
  "unraid": "unraid",
  "truenas": "truenas",
  "proxmox": "proxmox",
  "opnsense": "opnsense",
  "pfsense": "pfsense",
  "adguardhome": "adguard",
};

export function normalizeName(name: string): string {
  if (!name) return "";
  let clean = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return aliasMap[clean] || clean;
}

export function extractFromImage(image?: string | null): string {
  if (!image) return "";
  const parts = image.split("/");
  const lastPart = parts[parts.length - 1];
  const name = lastPart.split(":")[0];
  return normalizeName(name);
}

export function extractFromDomain(url?: string | null): string {
  if (!url) return "";
  try {
    const hostname = new URL(url).hostname;
    // se è un IP, non serve usarlo come nome brand
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return "";
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      return normalizeName(parts[parts.length - 2]); // radarr.duckdns.org -> radarr
    } else if (parts.length === 1) {
      return normalizeName(parts[0]);
    }
  } catch (e) {
    return "";
  }
  return "";
}

export function resolveIcon(
  customIcon?: string | null,
  dockerImage?: string | null,
  containerName?: string | null,
  url?: string | null
): { type: "custom" | "brand" | "lucide"; value: string } {
  // 1. Prioritize user custom icon (upload or direct URL)
  if (customIcon) {
    if (customIcon.startsWith("http") || customIcon.startsWith("/")) {
      return { type: "custom", value: customIcon };
    }
    // If it's a typed brand name (e.g. "radarr")
    const cleanCustom = normalizeName(customIcon);
    if (dashboardIcons.includes(cleanCustom)) {
      return { type: "brand", value: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${cleanCustom}.svg` };
    }
    if (dashboardIcons.includes(`${cleanCustom}-dark`)) {
      return { type: "brand", value: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${cleanCustom}-dark.svg` };
    }
  }

  // 2. Cascade logic
  const candidates = [
    extractFromImage(dockerImage),
    normalizeName(containerName || ""),
    extractFromDomain(url)
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (dashboardIcons.includes(candidate)) {
      return {
        type: "brand",
        value: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${candidate}.svg`
      };
    }
    if (dashboardIcons.includes(`${candidate}-dark`)) {
      return {
        type: "brand",
        value: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${candidate}-dark.svg`
      };
    }
  }

  // 3. Fallback
  return { type: "lucide", value: "Box" };
}
