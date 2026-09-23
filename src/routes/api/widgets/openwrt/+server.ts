import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { decryptString } from "$lib/server/crypto";
import { Agent, fetch as undiciFetch } from "undici";
import type { RequestHandler } from "./$types";

// Cache for token to avoid re-authenticating every time
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const agent = new Agent({
  connect: { rejectUnauthorized: false },
});

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const settings = await getSettings();
    if (
      (settings.openwrt_require_auth === "true" ||
        settings.openwrt_require_auth === true) &&
      !locals.isAdmin
    ) {
      return json({ error: "Non autorizzato" }, { status: 401 });
    }

    const url = settings.openwrt_url as string;
    const username = settings.openwrt_username as string;
    const encryptedPassword = settings.openwrt_password as string;

    if (!url || !username || !encryptedPassword) {
      return json({ error: "OpenWRT non configurato" }, { status: 400 });
    }

    let password = "";
    try {
      password = decryptString(encryptedPassword);
    } catch (e) {
      return json(
        { error: "Errore decrittazione credenziali OpenWRT" },
        { status: 500 },
      );
    }

    let normalizedUrl = url.replace(/\/$/, "");
    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    // 1. Authenticate if no valid token
    if (!cachedToken || !tokenExpiry || Date.now() > tokenExpiry) {
      const authRes = await undiciFetch(`${normalizedUrl}/ubus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "call",
          params: [
            "00000000000000000000000000000000",
            "session",
            "login",
            { username: username, password: password },
          ],
        }),
        dispatcher: agent,
      });

      if (!authRes.ok) {
        return json(
          { error: "Connessione a OpenWRT fallita (HTTP error)" },
          { status: authRes.status },
        );
      }

      const authData = (await authRes.json()) as any;
      if (authData.error) {
        return json(
          {
            error: "Autenticazione OpenWRT fallita",
            details: authData.error.message,
          },
          { status: 401 },
        );
      }

      // Token is usually in result[1].ubus_rpc_session
      if (
        authData.result &&
        authData.result[1] &&
        authData.result[1].ubus_rpc_session
      ) {
        cachedToken = authData.result[1].ubus_rpc_session;
        // Token is valid for some time, let's cache for 5 minutes
        tokenExpiry = Date.now() + 5 * 60 * 1000;
      } else {
        return json(
          { error: "Impossibile recuperare il token di sessione da OpenWRT" },
          { status: 500 },
        );
      }
    }

    // 2. Fetch System Info (system, info)
    const sysRes = await undiciFetch(`${normalizedUrl}/ubus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "call",
        params: [cachedToken, "system", "info", {}],
      }),
      dispatcher: agent,
    });

    // 3. Fetch Network Interfaces (network.interface, dump)
    const netRes = await undiciFetch(`${normalizedUrl}/ubus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "call",
        params: [cachedToken, "network.interface", "dump", {}],
      }),
      dispatcher: agent,
    });

    // 4. Fetch Network Devices (network.device, status)
    const devRes = await undiciFetch(`${normalizedUrl}/ubus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "call",
        params: [cachedToken, "network.device", "status", {}],
      }),
      dispatcher: agent,
    });

    if (!sysRes.ok || !netRes.ok || !devRes.ok) {
      cachedToken = null; // Invalidate cache on failure
      return json(
        { error: "Errore nel recupero dati da OpenWRT" },
        { status: 500 },
      );
    }

    const sysData = (await sysRes.json()) as any;
    const netData = (await netRes.json()) as any;
    const devData = (await devRes.json()) as any;

    if (sysData.error || netData.error || devData.error) {
      // Probably token expired or ACL issue
      cachedToken = null;
      return json(
        { error: "Errore API OpenWRT (forse permessi ACL o sessione scaduta)" },
        { status: 403 },
      );
    }

    const systemInfo = sysData.result?.[1] || {};
    const interfaces = netData.result?.[1]?.interface || [];

    // Filter important interfaces: wan, wan6, lan, wg0
    const importantInterfaces = interfaces
      .filter((iface: any) => !iface.interface.startsWith("loopback"))
      .map((iface: any) => {
        return {
          name: iface.interface,
          device: iface.device,
          up: iface.up,
          uptime: iface.uptime,
          ipv4: iface["ipv4-address"]?.map((ip: any) => ip.address) || [],
          ipv6: iface["ipv6-address"]?.map((ip: any) => ip.address) || [],
          rx_bytes: iface.data?.rx_bytes || 0,
          tx_bytes: iface.data?.tx_bytes || 0,
        };
      });

    const rawDevices = devData.result?.[1] || {};
    const devices = Object.keys(rawDevices)
      .map((devName) => {
        const d = rawDevices[devName];
        return {
          name: devName,
          up: d.up || false,
          macaddr: d.macaddr,
          speed: d.speed || null,
          type: d.type || "unknown",
        };
      })
      .filter((d) => !d.name.startsWith("lo"));

    return json({
      system: {
        uptime: systemInfo.uptime,
        load: systemInfo.load,
        memory: systemInfo.memory,
      },
      interfaces: importantInterfaces,
      devices,
    });
  } catch (e: any) {
    console.error("OpenWRT Error:", e);
    return json(
      { error: "Errore di connessione a OpenWRT", details: e.message },
      { status: 500 },
    );
  }
};
