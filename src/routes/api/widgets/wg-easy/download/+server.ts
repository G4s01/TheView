import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { decryptString } from "$lib/server/crypto";
import { Agent, fetch as undiciFetch } from "undici";
import type { RequestHandler } from "./$types";

const agent = new Agent({ connect: { rejectUnauthorized: false } });

// We need getAuthCookie again, let's just implement a quick auth here or refactor.
// For simplicity, we just authenticate on every request for download, or copy the logic.
let cachedCookie: string | null = null;
let cookieExpiry: number | null = null;

async function getAuthCookie(normalizedUrl: string, password: string) {
  if (cachedCookie && cookieExpiry && Date.now() < cookieExpiry)
    return cachedCookie;
  const authRes = await undiciFetch(`${normalizedUrl}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    dispatcher: agent,
  });
  await authRes.text().catch(() => "");
  if (!authRes.ok) return null;
  const setCookies = authRes.headers.getSetCookie
    ? authRes.headers.getSetCookie()
    : [authRes.headers.get("set-cookie") || ""];
  const sidCookie = setCookies.find((c) => c && c.startsWith("connect.sid="));
  if (sidCookie) {
    cachedCookie = sidCookie.split(";")[0];
    cookieExpiry = Date.now() + 24 * 60 * 60 * 1000;
    return cachedCookie;
  }
  return null;
}

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.isAdmin) return new Response("Unauthorized", { status: 401 });
  const id = url.searchParams.get("id");
  const type = url.searchParams.get("type");
  if (!id || (type !== "qrcode" && type !== "config"))
    return new Response("Bad Request", { status: 400 });

  const settings = await getSettings();
  const wgeasy_url = settings.wgeasy_url as string;
  const encryptedPassword = settings.wgeasy_password as string;

  if (!wgeasy_url || !encryptedPassword)
    return new Response("Configurazione mancante", { status: 400 });
  let password = "";
  try {
    password = decryptString(encryptedPassword);
  } catch (e) {
    return new Response("Errore decrittazione", { status: 500 });
  }

  let normalizedUrl = wgeasy_url.replace(/\/$/, "");
  if (!normalizedUrl.startsWith("http"))
    normalizedUrl = "https://" + normalizedUrl;

  try {
    const cookie = await getAuthCookie(normalizedUrl, password);
    if (!cookie) return new Response("Autenticazione fallita", { status: 401 });

    const path =
      type === "qrcode"
        ? `/api/wireguard/client/${id}/qrcode.svg`
        : `/api/wireguard/client/${id}/configuration`;
    const res = await undiciFetch(`${normalizedUrl}${path}`, {
      method: "GET",
      headers: { Cookie: cookie },
      dispatcher: agent,
    });

    if (!res.ok) {
      return new Response(`Errore ${res.status}`, { status: res.status });
    }

    const contentType =
      res.headers.get("content-type") ||
      (type === "qrcode" ? "image/svg+xml" : "text/plain");
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    if (type === "config") {
      headers.set("Content-Disposition", `attachment; filename="${id}.conf"`);
    }

    return new Response(res.body as any, { headers });
  } catch (e: any) {
    return new Response("Errore interno", { status: 500 });
  }
};
