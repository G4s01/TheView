import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getSettings } from "$lib/server/settings";
import { decryptString } from "$lib/server/crypto";
import { Agent, fetch as undiciFetch } from "undici";

let cachedToken: string | null = null;
let cookieLock: Promise<void> | null = null;

// Use undici to bypass self-signed cert issues
const agent = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
});

async function loginDuplicati(
  url: string,
  password: string,
): Promise<{ token: string | null; debug: any }> {
  try {
    const loginRes = await undiciFetch(`${url}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Password: password, RememberMe: true }),
      dispatcher: agent,
    });

    const body = await loginRes.text();
    const setCookie = loginRes.headers.get("set-cookie");

    let token: string | null = null;
    if (loginRes.ok) {
      let jsonBody: any = null;
      try {
        jsonBody = JSON.parse(body);
      } catch (e) {}

      if (jsonBody?.AccessToken) {
        token = jsonBody.AccessToken;
      } else if (jsonBody?.Token) {
        token = jsonBody.Token;
      } else if (setCookie) {
        const match = setCookie.match(/jwt=([^;]+)/i);
        if (match) {
          token = match[1];
        } else {
          token =
            setCookie.split(";")[0].split("=")[1] || setCookie.split(";")[0];
        }
      }
    }

    return {
      token,
      debug: { status: loginRes.status, headers: loginRes.headers, body },
    };
  } catch (e) {
    console.error("Duplicati login error:", e);
    return {
      token: null,
      debug: { error: e instanceof Error ? e.message : String(e) },
    };
  }
}

async function fetchDuplicatiApi(
  url: string,
  path: string,
  token: string | null,
  method = "GET",
  bodyObj?: any,
) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["Cookie"] = `jwt=${token}`;
  }

  if (bodyObj) {
    headers["Content-Type"] = "application/json";
  }

  const res = await undiciFetch(`${url}${path}`, {
    method,
    headers,
    body: bodyObj ? JSON.stringify(bodyObj) : undefined,
    dispatcher: agent,
  });

  const body = await res.text();
  return { status: res.status, ok: res.ok, body };
}

async function handleAuthenticatedRequest(
  url: string,
  password: string | null,
  requestFn: (token: string | null) => Promise<any>,
) {
  if (cookieLock) await cookieLock;

  let needsAuth = !!password;
  let res = await requestFn(cachedToken);

  if (res.status === 401 || res.status === 403 || res.status === 500) {
    cachedToken = null;
    if (needsAuth && password) {
      let resolveLock: () => void;
      cookieLock = new Promise((r) => {
        resolveLock = r;
      });

      try {
        const loginResult = await loginDuplicati(url, password);
        cachedToken = loginResult.token;
        if (!cachedToken) {
          resolveLock!();
          cookieLock = null;
          return {
            error: true,
            status: 401,
            data: { error: "Credenziali non valide", debug: loginResult.debug },
          };
        }
      } finally {
        resolveLock!();
        cookieLock = null;
      }

      res = await requestFn(cachedToken);
    }
  }

  if (!res.ok) {
    cachedToken = null;
    return {
      error: true,
      status: res.status,
      data: { error: `Errore API Duplicati: ${res.status}` },
    };
  }

  return {
    error: false,
    status: res.status,
    data: res.body ? JSON.parse(res.body) : null,
  };
}

export const GET: RequestHandler = async () => {
  try {
    const settings = await getSettings();
    const duplicati_url = settings.duplicati_url as string;
    const encryptedPassword = settings.duplicati_password as string;

    if (!duplicati_url)
      return json({ error: "Duplicati non configurato" }, { status: 400 });

    const normalizedUrl = duplicati_url.replace(/\/$/, "");
    let password = "";
    if (encryptedPassword) {
      try {
        password = decryptString(encryptedPassword);
      } catch (e) {
        return json(
          { error: "Errore decrittografia password" },
          { status: 500 },
        );
      }
    }

    const stateResult = await handleAuthenticatedRequest(
      normalizedUrl,
      password,
      (token) => fetchDuplicatiApi(normalizedUrl, "/api/v1/serverstate", token),
    );
    if (stateResult.error)
      return json(stateResult.data, { status: stateResult.status });

    const backupsResult = await handleAuthenticatedRequest(
      normalizedUrl,
      password,
      (token) => fetchDuplicatiApi(normalizedUrl, "/api/v1/backups", token),
    );
    if (backupsResult.error)
      return json(backupsResult.data, { status: backupsResult.status });

    // Try fetching progress state. It doesn't matter if it fails or returns 404, we just provide it if available.
    let progressState = null;
    const progResult = await handleAuthenticatedRequest(
      normalizedUrl,
      password,
      (token) =>
        fetchDuplicatiApi(
          normalizedUrl,
          `/api/v1/progressstate?t=${Date.now()}`,
          token,
        ),
    );
    if (!progResult.error) progressState = progResult.data;

    return json({
      serverState: stateResult.data,
      backups: backupsResult.data,
      progressState,
    });
  } catch (e: any) {
    console.error("Duplicati proxy GET error:", e);
    return json({ error: e.message || "Internal error" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const action = body.action;

    const settings = await getSettings();
    const duplicati_url = settings.duplicati_url as string;
    const encryptedPassword = settings.duplicati_password as string;

    if (!duplicati_url)
      return json({ error: "Duplicati non configurato" }, { status: 400 });

    const normalizedUrl = duplicati_url.replace(/\/$/, "");
    let password = "";
    if (encryptedPassword) {
      try {
        password = decryptString(encryptedPassword);
      } catch (e) {
        return json(
          { error: "Errore decrittografia password" },
          { status: 500 },
        );
      }
    }

    let path = "";
    let method = "POST";
    let reqBody = undefined;

    if (action === "pause") {
      let durStr = "";
      if (body.duration) {
        if (typeof body.duration === "number") {
          const mins = Math.max(1, Math.floor(body.duration / 60000));
          durStr = `?duration=${mins}m`;
        } else {
          durStr = `?duration=${body.duration}`;
        }
      }
      path = `/api/v1/serverstate/pause${durStr}`;
    } else if (action === "resume") {
      path = `/api/v1/serverstate/resume`;
    } else if (action === "run") {
      path = `/api/v1/backup/${body.id}/start`;
    } else if (action === "stop") {
      if (body.taskId) {
        path = `/api/v1/task/${body.taskId}/stop`;
      } else {
        path = `/api/v1/serverstate/stop`;
      }
    }

    if (!path) return json({ error: "Azione non supportata" }, { status: 400 });

    const result = await handleAuthenticatedRequest(
      normalizedUrl,
      password,
      (token) => fetchDuplicatiApi(normalizedUrl, path, token, method, reqBody),
    );

    if (result.error) return json(result.data, { status: result.status });
    return json({ success: true, data: result.data });
  } catch (e: any) {
    console.error("Duplicati proxy POST error:", e);
    return json({ error: e.message || "Internal error" }, { status: 500 });
  }
};
