import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { decryptString } from "$lib/server/crypto";
import { Agent, fetch as undiciFetch } from "undici";
import type { RequestHandler } from "./$types";

// Cache for session cookie
let cachedCookie: string | null = null;
let cookieExpiry: number | null = null;

const agent = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
});

async function getAuthCookie(normalizedUrl: string, password: string) {
  if (cachedCookie && cookieExpiry && Date.now() < cookieExpiry) {
    return cachedCookie;
  }
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
    settings["wgeasy_require_auth"] === "true" ||
    settings["wgeasy_require_auth"] === true;
  if (requireAuth && !locals.isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const wgeasy_url = settings.wgeasy_url as string;
  const encryptedPassword = settings.wgeasy_password as string;

  if (!wgeasy_url || !encryptedPassword)
    return json({ error: "Configurazione mancante" }, { status: 400 });

  let password = "";
  try {
    password = decryptString(encryptedPassword);
  } catch (e) {
    return json({ error: "Errore decrittazione" }, { status: 500 });
  }

  let normalizedUrl = wgeasy_url.replace(/\/$/, "");
  if (!normalizedUrl.startsWith("http"))
    normalizedUrl = "https://" + normalizedUrl;

  try {
    const cookie = await getAuthCookie(normalizedUrl, password);
    if (!cookie)
      return json({ error: "Autenticazione fallita" }, { status: 401 });

    const clientsRes = await undiciFetch(
      `${normalizedUrl}/api/wireguard/client`,
      {
        method: "GET",
        headers: { Cookie: cookie, Accept: "application/json" },
        dispatcher: agent,
      },
    );

    if (!clientsRes.ok) {
      cachedCookie = null;
      return json({ error: `Recupero fallito` }, { status: clientsRes.status });
    }
    const clientsData = await clientsRes.json();
    return json(clientsData);
  } catch (e: any) {
    return json({ error: "Errore di connessione" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) return new Response("Unauthorized", { status: 401 });
  const settings = await getSettings();
  const wgeasy_url = settings.wgeasy_url as string;
  const encryptedPassword = settings.wgeasy_password as string;

  if (!wgeasy_url || !encryptedPassword)
    return json({ error: "Configurazione mancante" }, { status: 400 });
  let password = "";
  try {
    password = decryptString(encryptedPassword);
  } catch (e) {
    return json({ error: "Errore decrittazione" }, { status: 500 });
  }

  let normalizedUrl = wgeasy_url.replace(/\/$/, "");
  if (!normalizedUrl.startsWith("http"))
    normalizedUrl = "https://" + normalizedUrl;

  try {
    const body = await request.json();
    const action = body.action;
    const cookie = await getAuthCookie(normalizedUrl, password);
    if (!cookie)
      return json({ error: "Autenticazione fallita" }, { status: 401 });

    let path = "";
    let method = "POST";
    let reqBody: any = undefined;

    if (action === "enable") {
      path = `/api/wireguard/client/${body.id}/enable`;
    } else if (action === "disable") {
      path = `/api/wireguard/client/${body.id}/disable`;
    } else if (action === "add") {
      path = `/api/wireguard/client`;
      reqBody = JSON.stringify({ name: body.name });
    } else if (action === "delete") {
      path = `/api/wireguard/client/${body.id}`;
      method = "DELETE";
    }

    if (!path) return json({ error: "Azione non valida" }, { status: 400 });

    const res = await undiciFetch(`${normalizedUrl}${path}`, {
      method,
      headers: { Cookie: cookie, "Content-Type": "application/json" },
      body: reqBody,
      dispatcher: agent,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return json(
        { error: "Errore azione", details: errText },
        { status: res.status },
      );
    }

    return json({ success: true });
  } catch (e: any) {
    return json({ error: "Errore di connessione" }, { status: 500 });
  }
};
