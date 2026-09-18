import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getSettings } from "$lib/server/settings";
import { decryptString } from "$lib/server/crypto";
import { Agent, fetch as undiciFetch } from "undici";

const agent = new Agent({ connect: { rejectUnauthorized: false } });

let cachedCookie: string | null = null;
let cookieExpiry: number | null = null;
let defaultEnvId: number | null = null;

async function getAuthCookie(
  url: string,
  username?: string,
  password?: string,
) {
  if (cachedCookie && cookieExpiry && Date.now() < cookieExpiry)
    return cachedCookie;

  const loginRes = await undiciFetch(`${url}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    dispatcher: agent,
  });

  if (!loginRes.ok) {
    throw new Error("Autenticazione Dockhand fallita");
  }

  const setCookies = loginRes.headers.getSetCookie
    ? loginRes.headers.getSetCookie()
    : [loginRes.headers.get("set-cookie") || ""];
  const sessionCookie = setCookies.find(
    (c) => c && c.startsWith("dockhand_session="),
  );
  if (sessionCookie) {
    cachedCookie = sessionCookie.split(";")[0];
    cookieExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24h
    return cachedCookie;
  }
  throw new Error("Nessun cookie di sessione trovato");
}

async function getDefaultEnvId(url: string, cookie: string) {
  if (defaultEnvId !== null) return defaultEnvId;
  const res = await undiciFetch(`${url}/api/environments`, {
    headers: { Cookie: cookie },
    dispatcher: agent,
  });
  if (!res.ok) throw new Error("Failed to fetch environments");
  const envs: any = await res.json();
  if (envs && envs.length > 0) {
    defaultEnvId = envs[0].id;
    return defaultEnvId;
  }
  throw new Error("Nessun environment trovato in Dockhand");
}

export const GET: RequestHandler = async () => {
  try {
    const settings = await getSettings();
    const url = settings.dockhand_url as string;
    const username = settings.dockhand_username as string;
    let password = settings.dockhand_password as string;

    if (!url)
      return json({ error: "Dockhand non configurato" }, { status: 400 });
    if (password) password = decryptString(password);

    const normalizedUrl = url.replace(/\/$/, "");
    const cookie = await getAuthCookie(normalizedUrl, username, password);
    const envId = await getDefaultEnvId(normalizedUrl, cookie);

    const res = await undiciFetch(
      `${normalizedUrl}/api/containers?env=${envId}`,
      {
        headers: { Cookie: cookie },
        dispatcher: agent,
      },
    );

    if (!res.ok) {
      if (res.status === 401) cachedCookie = null; // force relogin next time
      throw new Error(`Errore fetch containers: ${res.status}`);
    }

    const containers: any = await res.json();

    // Fetch pending updates
    const updatesRes = await undiciFetch(
      `${normalizedUrl}/api/containers/check-updates?env=${envId}`,
      {
        headers: { Cookie: cookie },
        dispatcher: agent,
      },
    );

    if (updatesRes.ok) {
      const updatesData: any = await updatesRes.json();
      const pendingIds = new Set(
        updatesData.pendingUpdates?.map((u: any) => u.containerId) || [],
      );
      for (const c of containers) {
        c.updateAvailable = pendingIds.has(c.id);
      }
    }

    return json(containers);
  } catch (e: any) {
    return json({ error: e.message || "Errore interno" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const settings = await getSettings();
    const url = settings.dockhand_url as string;
    const username = settings.dockhand_username as string;
    let password = settings.dockhand_password as string;

    if (!url)
      return json({ error: "Dockhand non configurato" }, { status: 400 });
    if (password) password = decryptString(password);

    const normalizedUrl = url.replace(/\/$/, "");
    const cookie = await getAuthCookie(normalizedUrl, username, password);
    const envId = await getDefaultEnvId(normalizedUrl, cookie);

    const { id, action, payload } = await request.json();
    if (!action) return json({ error: "Azione mancante" }, { status: 400 });

    const headers: Record<string, string> = { Cookie: cookie };
    let body: string | undefined = undefined;
    let endpoint = "";

    if (action === "checkUpdates") {
      endpoint = `${normalizedUrl}/api/containers/check-updates?env=${envId}`;
      headers["Accept"] = "application/json";
    } else {
      if (!id) return json({ error: "ID container mancante" }, { status: 400 });

      // Map the "update" action from frontend to Dockhand's "update" endpoint
      let targetAction = action;

      endpoint = `${normalizedUrl}/api/containers/${id}/${targetAction}?env=${envId}`;

      if (action === "update") {
        if (!payload || !payload.image || !payload.name) {
          return json(
            { error: "Dati payload mancanti per aggiornamento" },
            { status: 400 },
          );
        }
        body = JSON.stringify({
          image: payload.image,
          name: payload.name,
          repullImage: true,
          startAfterUpdate: true,
        });
        headers["Content-Type"] = "application/json";
      }
    }

    const res = await undiciFetch(endpoint, {
      method: "POST",
      headers,
      body,
      dispatcher: agent,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 401) cachedCookie = null;
      throw new Error(`Errore API Dockhand: ${res.status} ${text}`);
    }

    if (action === "checkUpdates") {
      return json(await res.json());
    }

    // Se era un update, forziamo uno start finale sul nome del container
    // dato che a volte Dockhand lo ricrea ma lo lascia spento/pending.
    // Usiamo payload.name perché l'ID hash potrebbe essere cambiato dopo la ricreazione.
    if (action === "update" && payload && payload.name) {
      try {
        await undiciFetch(
          `${normalizedUrl}/api/containers/${payload.name}/start?env=${envId}`,
          {
            method: "POST",
            headers: { Cookie: cookie },
            dispatcher: agent,
          },
        );
      } catch (startErr) {
        console.error(
          "Errore durante lo start automatico post-update:",
          startErr,
        );
      }
    }

    return json({ success: true });
  } catch (e: any) {
    return json({ error: e.message || "Errore interno" }, { status: 500 });
  }
};
