import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { decryptString } from "$lib/server/crypto";
import type { RequestHandler } from "./$types";
import { Agent, fetch as undiciFetch } from "undici";

const agent = new Agent({ connect: { rejectUnauthorized: false } });

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAuthToken(url: string, username?: string, password?: string) {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry)
    return cachedToken;

  // FileBrowser Quantum expects username in query and password URL-encoded in X-Password header
  const encodedUsername = encodeURIComponent(username || "");
  const encodedPassword = encodeURIComponent(password || "");

  const loginRes = await undiciFetch(
    `${url}/api/auth/login?username=${encodedUsername}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Password": encodedPassword,
      },
      dispatcher: agent,
    },
  );

  if (!loginRes.ok) {
    throw new Error("Credenziali errate o autenticazione Filebrowser fallita");
  }

  const token = await loginRes.text();
  if (token) {
    cachedToken = token;
    tokenExpiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    return cachedToken;
  }
  throw new Error("Nessun token restituito da Filebrowser");
}

export const GET: RequestHandler = async ({ url, locals }) => {
  const serviceId = url.searchParams.get("id");
  if (!serviceId)
    return new Response("Bad Request: missing id", { status: 400 });

  const serviceIdParsed = parseInt(serviceId, 10);
  if (isNaN(serviceIdParsed))
    return new Response("Bad Request: invalid id", { status: 400 });

  const service = await db
    .select()
    .from(services)
    .where(eq(services.id, serviceIdParsed))
    .get();
  if (!service)
    return new Response("Not Found: service does not exist", { status: 404 });

  const settings = await getSettings();
  const requireAuth =
    settings["filebrowser_require_auth"] === "true" ||
    settings["filebrowser_require_auth"] === true;
  if (requireAuth && !locals.isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const url = settings.filebrowser_url as string;
    const username = settings.filebrowser_username as string;
    let password = settings.filebrowser_password as string;

    if (!url)
      return json({ error: "Filebrowser non configurato" }, { status: 400 });
    if (password) password = decryptString(password);

    const normalizedUrl = url.replace(/\/$/, "");

    let token = "";
    if (username || password) {
      token = await getAuthToken(normalizedUrl, username, password);
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["X-JWT-Assertion"] = token;
      headers["X-Auth"] = token; // Legacy fallback just in case
    }

    const res = await undiciFetch(`${normalizedUrl}/api/settings/sources`, {
      headers,
      dispatcher: agent,
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) cachedToken = null; // force relogin next time
      if (res.status === 401 && !username && !password) {
        throw new Error(
          "Il servizio richiede l'autenticazione. Inserisci le credenziali di Filebrowser nelle impostazioni del widget.",
        );
      }
      throw new Error(`Errore fetch usage (Status ${res.status})`);
    }

    const sources: any = await res.json();

    // Aggregate usage from all sources
    let total = 0;
    let used = 0;

    if (sources && typeof sources === "object") {
      for (const key of Object.keys(sources)) {
        const source = sources[key];
        if (source && typeof source === "object") {
          total += source.total || 0;
          used += source.used || 0;
        }
      }
    }

    return json({ total, used });
  } catch (e: any) {
    return json({ error: e.message || "Errore interno" }, { status: 500 });
  }
};
