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

  const loginRes = await undiciFetch(`${url}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    dispatcher: agent,
  });

  if (!loginRes.ok) {
    throw new Error("Autenticazione Filebrowser fallita");
  }

  const token = await loginRes.text();
  if (token) {
    cachedToken = token;
    tokenExpiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    return cachedToken;
  }
  throw new Error("Nessun token restituito da Filebrowser");
}

export const GET: RequestHandler = async () => {
  try {
    const settings = await getSettings();
    const url = settings.filebrowser_url as string;
    const username = settings.filebrowser_username as string;
    let password = settings.filebrowser_password as string;

    if (!url)
      return json({ error: "Filebrowser non configurato" }, { status: 400 });
    if (password) password = decryptString(password);

    const normalizedUrl = url.replace(/\/$/, "");
    const token = await getAuthToken(normalizedUrl, username, password);

    const res = await undiciFetch(`${normalizedUrl}/api/usage/`, {
      headers: { "X-Auth": token },
      dispatcher: agent,
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) cachedToken = null; // force relogin next time
      throw new Error(`Errore fetch usage: ${res.status}`);
    }

    const usage: any = await res.json();
    return json(usage);
  } catch (e: any) {
    return json({ error: e.message || "Errore interno" }, { status: 500 });
  }
};
