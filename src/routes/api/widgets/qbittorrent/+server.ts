import { rewriteUrlForDocker } from "$lib/server/dockerHost";
import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { getSettings } from "$lib/server/settings";

// Cache in RAM per evitare di rifare login a ogni polling
let cookieCache = "";

export async function GET() {
  const settings = getSettings();
  const qbitUrl = settings.qbit_url || env.QBIT_URL || "http://172.17.0.1:8080";
  const qbitUser = settings.qbit_username || env.QBIT_USERNAME;
  const qbitPass = settings.qbit_password || env.QBIT_PASSWORD;

  async function fetchTransferInfo(cookie: string) {
    return fetch(`${qbitUrl}/api/v2/transfer/info`, {
      headers: cookie ? { Cookie: cookie } : {},
    });
  }

  try {
    let res = await fetchTransferInfo(cookieCache);

    // 403 Forbidden indica che serve il login (o che il SID è scaduto)
    if (res.status === 403) {
      if (!qbitUser || !qbitPass) {
        return json(
          {
            error: "Auth needed. Configure qBittorrent in Settings",
          },
          { status: 401 },
        );
      }

      const loginParams = new URLSearchParams();
      loginParams.append("username", qbitUser);
      loginParams.append("password", qbitPass);

      const loginRes = await fetch(`${qbitUrl}/api/v2/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: loginParams,
      });

      const setCookie = loginRes.headers.get("set-cookie");
      if (loginRes.ok && setCookie) {
        cookieCache = setCookie.split(";")[0]; // Prende solo SID=...
        res = await fetchTransferInfo(cookieCache); // Riprova la fetch
      } else {
        return json({ error: "qBittorrent Login failed" }, { status: 401 });
      }
    }

    if (!res.ok) {
      return json(
        { error: "Failed to fetch info", status: res.status },
        { status: res.status },
      );
    }

    const data = await res.json();
    return json({
      dl_info_speed: data.dl_info_speed,
      up_info_speed: data.up_info_speed,
      connection_status: data.connection_status,
    });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
