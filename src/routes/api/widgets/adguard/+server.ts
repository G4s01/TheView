import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { decryptString } from "$lib/server/crypto";
import type { RequestHandler } from "./$types";
import { Agent, fetch as undiciFetch } from "undici";

// Inietta l'Agent per chiamate con certificati self-signed
const agent = new Agent({ connect: { rejectUnauthorized: false } });

interface AdGuardActionBody {
  action: "enable" | "disable";
  duration?: number;
}

async function getAdGuardConfig() {
  const settings = await getSettings();
  if (
    !settings.adguard_url ||
    !settings.adguard_username ||
    !settings.adguard_password
  ) {
    return null;
  }
  return {
    url: settings.adguard_url.replace(/\/$/, ""),
    username: settings.adguard_username,
    password: decryptString(settings.adguard_password),
  };
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
    settings["adguard_require_auth"] === "true" ||
    settings["adguard_require_auth"] === true;
  if (requireAuth && !locals.isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const config = await getAdGuardConfig();
  if (!config)
    return json({ error: "AdGuard non configurato" }, { status: 400 });

  const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;

  try {
    const [statsRes, statusRes] = await Promise.all([
      undiciFetch(`${config.url}/control/stats`, {
        headers: { Authorization: authHeader },
        dispatcher: agent,
      }),
      undiciFetch(`${config.url}/control/status`, {
        headers: { Authorization: authHeader },
        dispatcher: agent,
      }),
    ]);

    if (!statsRes.ok || !statusRes.ok) {
      const statsError = statsRes.ok
        ? ""
        : await statsRes.text().catch(() => "stats error");
      const statusError = statusRes.ok
        ? ""
        : await statusRes.text().catch(() => "status error");
      return json(
        {
          error: "Recupero dati da AdGuard fallito",
          details: { statsError, statusError },
        },
        { status: 502 },
      );
    }

    const stats = await statsRes.json();
    const status = await statusRes.json();

    return json({ stats, status });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Errore sconosciuto";
    console.error("AdGuard proxy error:", errorMessage);
    return json(
      { error: "Connessione ad AdGuard fallita", details: errorMessage },
      { status: 500 },
    );
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Non autorizzato" }, { status: 401 });
  }

  const config = await getAdGuardConfig();
  if (!config)
    return json({ error: "AdGuard non configurato" }, { status: 400 });

  const body = await request.json().catch(() => null);
  if (!body) {
    return json(
      { error: "Payload JSON mancante o non valido" },
      { status: 400 },
    );
  }

  const { action, duration } = body as AdGuardActionBody;
  if (action !== "enable" && action !== "disable") {
    return json({ error: "Azione non valida" }, { status: 400 });
  }

  const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;

  try {
    const payload =
      action === "enable"
        ? { enabled: true }
        : { enabled: false, ...(duration ? { duration } : {}) };

    const res = await undiciFetch(`${config.url}/control/protection`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      dispatcher: agent,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "unknown error");
      return json(
        { error: "Aggiornamento protezione fallito", details: errorText },
        { status: 502 },
      );
    }

    return json({ success: true });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Errore sconosciuto";
    console.error("AdGuard toggle error:", errorMessage);
    return json(
      { error: "Connessione ad AdGuard fallita", details: errorMessage },
      { status: 500 },
    );
  }
};
