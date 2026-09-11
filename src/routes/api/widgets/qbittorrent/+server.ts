import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { decryptString } from "$lib/server/crypto";
import { Agent, fetch as undiciFetch } from "undici";
import { rewriteUrlForDocker } from "$lib/server/dockerHost";

// Cache in RAM per evitare di rifare login a ogni polling
let cookieCache = "";

export async function GET() {
  try {
    const settings = await getSettings();
    const url = settings.qbit_url;
    const username = settings.qbit_username;
    const passwordEnc = settings.qbit_password;

    if (!url || !username || !passwordEnc) {
      return json(
        { error: "Credenziali qBittorrent non configurate" },
        { status: 400 },
      );
    }

    const password = decryptString(passwordEnc);
    if (!password) {
      return json({ error: "Errore decrittografia password" }, { status: 401 });
    }

    const agent = new Agent({ connect: { rejectUnauthorized: false } });
    const rawTargetUrl = rewriteUrlForDocker(url);
    const targetUrl = rawTargetUrl.endsWith("/")
      ? rawTargetUrl.slice(0, -1)
      : rawTargetUrl;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const reqHeaders = new Headers();
    if (cookieCache) {
      reqHeaders.set("Cookie", cookieCache);
    }
    reqHeaders.set("Referer", targetUrl);

    try {
      let transferRes = await undiciFetch(`${targetUrl}/api/v2/transfer/info`, {
        headers: reqHeaders,
        dispatcher: agent,
        signal: controller.signal as any,
      });

      // 403 Forbidden indicates auth is needed
      if (transferRes.status === 403) {
        const loginForm = new URLSearchParams();
        loginForm.append("username", username);
        loginForm.append("password", password);

        const loginRes = await undiciFetch(`${targetUrl}/api/v2/auth/login`, {
          method: "POST",
          body: loginForm.toString(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Referer: targetUrl,
          },
          dispatcher: agent,
          signal: controller.signal as any,
        });

        if (!loginRes.ok) {
          clearTimeout(timeoutId);
          return json({ error: "AUTENTICAZIONE FALLITA" }, { status: 401 });
        }

        const cookies = loginRes.headers.getSetCookie
          ? loginRes.headers.getSetCookie()
          : [loginRes.headers.get("set-cookie") || ""];
        let sidMatch = false;
        for (const c of cookies) {
          if (!c) continue;
          const match = c.match(/SID=([^;]+)/);
          if (match) {
            cookieCache = `SID=${match[1]}`;
            sidMatch = true;
          }
        }

        if (!sidMatch) {
          clearTimeout(timeoutId);
          return json({ error: "Cookie SID mancante" }, { status: 401 });
        }

        reqHeaders.set("Cookie", cookieCache);

        // Retry transfer info
        transferRes = await undiciFetch(`${targetUrl}/api/v2/transfer/info`, {
          headers: reqHeaders,
          dispatcher: agent,
          signal: controller.signal as any,
        });
      }

      if (!transferRes.ok) {
        clearTimeout(timeoutId);
        return json(
          { error: "Errore recupero transfer info" },
          { status: transferRes.status },
        );
      }

      const activeTorrentsRes = await undiciFetch(
        `${targetUrl}/api/v2/torrents/info?filter=all`,
        {
          headers: reqHeaders,
          dispatcher: agent,
          signal: controller.signal as any,
        },
      );

      clearTimeout(timeoutId);

      if (!activeTorrentsRes.ok) {
        return json(
          { error: "Errore recupero torrents info" },
          { status: activeTorrentsRes.status },
        );
      }

      const transferData = (await transferRes.json()) as any;
      const allTorrentsData = (await activeTorrentsRes.json()) as any[];

      const active_torrents = Array.isArray(allTorrentsData)
        ? allTorrentsData.filter((t) =>
            [
              "downloading",
              "uploading",
              "stalledDL",
              "stalledUP",
              "metaDL",
            ].includes(t.state),
          ).length
        : 0;

      let sortedTorrents = Array.isArray(allTorrentsData)
        ? [...allTorrentsData]
        : [];
      sortedTorrents.sort((a, b) => {
        const isActiveA = ["downloading", "uploading", "metaDL"].includes(
          a.state,
        )
          ? 1
          : 0;
        const isActiveB = ["downloading", "uploading", "metaDL"].includes(
          b.state,
        )
          ? 1
          : 0;
        if (isActiveA !== isActiveB) return isActiveB - isActiveA;
        return b.dlspeed - a.dlspeed;
      });

      const torrentsList = sortedTorrents.slice(0, 5).map((t) => ({
        hash: t.hash,
        name: t.name,
        progress: (t.progress || 0) * 100,
        dlspeed: t.dlspeed,
        state: t.state,
        eta: t.eta,
        connection_status: `peers: ${t.num_leechs || 0}/${t.num_incomplete || 0}, seeds: ${t.num_seeds || 0}/${t.num_complete || 0}`,
      }));

      return json({
        dl_info_speed: transferData.dl_info_speed || 0,
        up_info_speed: transferData.up_info_speed || 0,
        active_torrents,
        torrents: torrentsList,
      });
    } catch (e: any) {
      clearTimeout(timeoutId);
      throw e;
    }
  } catch (e: any) {
    console.error("qBittorrent proxy error:", e);
    if (e.name === "AbortError" || e.message?.includes("abort")) {
      return json(
        { error: "Timeout connessione a qBittorrent" },
        { status: 504 },
      );
    }
    return json({ error: "Errore interno proxy" }, { status: 500 });
  }
}

export async function POST({ request, locals }) {
  if (!locals.isAdmin) return json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await getSettings();
    const url = settings.qbit_url;
    if (!url)
      return json({ error: "qBittorrent not configured" }, { status: 400 });

    const agent = new Agent({ connect: { rejectUnauthorized: false } });
    const rawTargetUrl = rewriteUrlForDocker(url);
    const targetUrl = rawTargetUrl.endsWith("/")
      ? rawTargetUrl.slice(0, -1)
      : rawTargetUrl;

    const headersObj: Record<string, string> = {
      Referer: targetUrl,
    };
    if (cookieCache) {
      headersObj["Cookie"] = cookieCache;
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      headersObj["Content-Type"] = contentType; // Forward the boundary!

      const res = await undiciFetch(`${targetUrl}/api/v2/torrents/add`, {
        method: "POST",
        headers: headersObj,
        body: request.body as any,
        dispatcher: agent,
        duplex: "half",
      });

      let errorText = "";
      console.log(`Add action status: ${res.status}`);
      if (!res.ok) {
        errorText = await res.text();
        console.log(`Add failed: ${errorText}`);
        return json(
          { error: "Add failed", details: errorText },
          { status: res.status },
        );
      }
      return json({ success: true });
    } else {
      const { hash, action } = await request.json();
      if (!hash || !["pause", "resume", "delete"].includes(action)) {
        return json({ error: "Invalid parameters" }, { status: 400 });
      }

      const actionMap: Record<string, string> = {
        pause: "stop",
        resume: "start",
        delete: "delete",
      };
      const mappedAction = actionMap[action];

      const form = new URLSearchParams();
      form.append("hashes", hash);
      if (mappedAction === "delete") {
        form.append("deleteFiles", "false");
      }

      headersObj["Content-Type"] = "application/x-www-form-urlencoded";

      const res = await undiciFetch(
        `${targetUrl}/api/v2/torrents/${mappedAction}`,
        {
          method: "POST",
          headers: headersObj,
          body: form.toString(),
          dispatcher: agent,
        },
      );

      console.log(`qBittorrent action ${mappedAction} status:`, res.status);

      if (!res.ok) {
        console.log(
          `qBittorrent action ${action} failed. Status: ${res.status}. Body: ${await res.text()}`,
        );
        return json({ error: "Action failed" }, { status: res.status });
      }

      return json({ success: true });
    }
  } catch (e: any) {
    console.error("qBittorrent action error:", e);
    return json({ error: "Action error" }, { status: 500 });
  }
}
