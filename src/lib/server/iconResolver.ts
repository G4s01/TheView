import { DEFAULT_ALIASES } from "./defaultAliases";
import { dashboardIcons } from "./dashboardIcons";
import fs from "node:fs";
import path from "node:path";


const ALIASES_FILE_PATH = path.join(process.cwd(), "data", "aliases.json");
const CACHE_TTL = 5000; // 5 secondi
let cachedAliases: Record<string, string> | null = null;
let lastCacheTime = 0;

function getAliases(): Record<string, string> {
  const now = Date.now();
  if (cachedAliases && now - lastCacheTime < CACHE_TTL) {
    return cachedAliases;
  }

  try {
    if (!fs.existsSync(ALIASES_FILE_PATH)) {
      fs.mkdirSync(path.dirname(ALIASES_FILE_PATH), { recursive: true });
      fs.writeFileSync(
        ALIASES_FILE_PATH,
        JSON.stringify(DEFAULT_ALIASES, null, 2),
        "utf-8"
      );
      cachedAliases = DEFAULT_ALIASES;
    } else {
      const content = fs.readFileSync(ALIASES_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Il file JSON non contiene un oggetto valido");
      }
      cachedAliases = parsed as Record<string, string>;
    }
  } catch (error) {
    console.warn("[iconResolver] Errore durante la lettura di aliases.json:", error);
    cachedAliases = DEFAULT_ALIASES;
  }

  lastCacheTime = now;
  return cachedAliases;
}

const exactMatchOverrides: Record<
  string,
  { type: "custom" | "brand" | "lucide"; value: string }
> = {
  theview: { type: "custom", value: "/favicon.svg" },
};

export function normalizeName(name: string): string {
  if (!name) return "";
  let clean = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const aliases = getAliases();
  return aliases[clean] || clean;
}

export function extractFromImage(image?: string | null): string {
  if (!image) return "";

  // Rimuove registry/namespace (tutto ciò che c'è prima dell'ultimo /)
  const parts = image.split("/");
  const lastPart = parts[parts.length - 1];

  // Rimuove digest se presente (es. @sha256:12345)
  const withoutDigest = lastPart.split("@")[0];

  // Rimuove il tag (tutto ciò che c'è dopo i :)
  const name = withoutDigest.split(":")[0];

  // Ritorna esattamente e solo il nome estratto (es. dockhand)
  return name;
}

export function extractFromDomain(url?: string | null): string {
  if (!url) return "";
  try {
    let validUrl = url;
    if (!validUrl.startsWith("http")) validUrl = "http://" + validUrl;

    const hostname = new URL(validUrl).hostname;
    // se è un IP, non serve usarlo come nome brand
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return "";

    const parts = hostname.split(".");

    // Se c'è un solo elemento (es. "localhost"), restituiscilo
    if (parts.length === 1) return parts[0];

    // Prendi la prima parte (es. "radarr" in "radarr.duckdns.org")
    // Se la prima parte è "www", prendi la seconda
    if (parts[0] === "www" && parts.length > 1) {
      return parts[1];
    }

    return parts[0];
  } catch (e) {
    return "";
  }
}

export function resolveIcon(
  customIcon?: string | null,
  dockerImage?: string | null,
  containerName?: string | null,
  url?: string | null,
): { type: "custom" | "brand" | "lucide"; value: string } {
  // 1. Priorità all'icona custom definita dall'utente
  if (customIcon) {
    if (customIcon.startsWith("http") || customIcon.startsWith("/")) {
      return { type: "custom", value: customIcon };
    }
    const cleanCustom = normalizeName(customIcon);
    if (exactMatchOverrides[cleanCustom]) {
      return exactMatchOverrides[cleanCustom];
    }
    if (dashboardIcons.includes(cleanCustom)) {
      return {
        type: "brand",
        value: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${cleanCustom}.svg`,
      };
    }
    if (dashboardIcons.includes(`${cleanCustom}-dark`)) {
      return {
        type: "brand",
        value: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${cleanCustom}-dark.svg`,
      };
    }
  }

  // 2. OVERRIDE STATICO PER "THEVIEW" (Auto-riconoscimento)
  if (
    (dockerImage && dockerImage.includes("ghcr.io/g4s01/theview")) ||
    (containerName && containerName.toLowerCase() === "theview")
  ) {
    return { type: "custom", value: "/favicon.svg" };
  }

  // Helper per la verifica all'interno di dashboardIcons
  const findBrandIcon = (candidate: string) => {
    if (!candidate) return null;
    if (exactMatchOverrides[candidate]) {
      return exactMatchOverrides[candidate];
    }
    if (dashboardIcons.includes(candidate)) {
      return {
        type: "brand" as const,
        value: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${candidate}.svg`,
      };
    }
    if (dashboardIcons.includes(`${candidate}-dark`)) {
      return {
        type: "brand" as const,
        value: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/${candidate}-dark.svg`,
      };
    }
    return null;
  };

  // 3. Discovery a cascata: IMMAGINE > CONTAINER > DOMINIO
  // Valutiamo rigorosamente in questo ordine per evitare match errati tramite blocchi if/else

  // A) Valuta l'estrazione dall'immagine Docker
  const rawImageName = extractFromImage(dockerImage);
  const imageCandidate = rawImageName ? normalizeName(rawImageName) : "";
  const imageMatch = findBrandIcon(imageCandidate);

  if (imageMatch) {
    return imageMatch; // Cortocircuito immediato
  } else {
    // B) Valuta il nome del container (se l'immagine non ha prodotto risultati)
    const containerCandidate = normalizeName(containerName || "");
    const containerMatch = findBrandIcon(containerCandidate);

    if (containerMatch) {
      return containerMatch;
    } else {
      // C) ULTIMA SPIAGGIA assoluta: Valuta il dominio se immagine e container falliscono
      const rawDomain = extractFromDomain(url);
      const domainCandidate = rawDomain ? normalizeName(rawDomain) : "";
      const domainMatch = findBrandIcon(domainCandidate);

      if (domainMatch) {
        return domainMatch;
      }
    }
  }

  // 4. Fallback (DuckDNS Paperella)
  return {
    type: "brand",
    value:
      "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/duckdns.svg",
  };
}
