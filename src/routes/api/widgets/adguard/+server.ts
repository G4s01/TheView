import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { decryptString } from "$lib/server/crypto";
import type { RequestHandler } from "./$types";
import { Agent } from "undici";

// Inietta l'Agent per chiamate con certificati self-signed
const agent = new Agent({ connect: { rejectUnauthorized: false } });

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

export const GET: RequestHandler = async () => {
  const config = await getAdGuardConfig();
  if (!config)
    return json({ error: "AdGuard not configured" }, { status: 400 });

  const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;

  try {
    const [statsRes, statusRes] = await Promise.all([
      fetch(`${config.url}/control/stats`, {
        headers: { Authorization: authHeader },
        dispatcher: agent,
      } as any),
      fetch(`${config.url}/control/status`, {
        headers: { Authorization: authHeader },
        dispatcher: agent,
      } as any),
    ]);

    if (!statsRes.ok || !statusRes.ok) {
      if (!statsRes.ok) console.log(await statsRes.text());
      if (!statusRes.ok) console.log(await statusRes.text());
      return json({ error: "Failed to fetch from AdGuard" }, { status: 502 });
    }

    const stats = await statsRes.json();
    const status = await statusRes.json();

    return json({ stats, status });
  } catch (err) {
    console.error("AdGuard proxy error:", err);
    return json({ error: "AdGuard connection failed" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getAdGuardConfig();
  if (!config)
    return json({ error: "AdGuard not configured" }, { status: 400 });

  const body = await request.json();
  const action = body.action;
  const duration = body.duration;

  const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;

  try {
    const res = await fetch(`${config.url}/control/protection`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        action === "enable"
          ? { enabled: true }
          : { enabled: false, ...(duration ? { duration } : {}) },
      ),
      dispatcher: agent,
    } as any);

    if (!res.ok) {
      console.log(await res.text());
      return json({ error: "Failed to toggle protection" }, { status: 502 });
    }

    return json({ success: true });
  } catch (err) {
    console.error("AdGuard toggle error:", err);
    return json({ error: "AdGuard connection failed" }, { status: 500 });
  }
};
