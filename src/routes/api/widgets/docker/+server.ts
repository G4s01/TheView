import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getSettings } from "$lib/server/settings";
import * as http from "http";
import { Agent, fetch as undiciFetch } from "undici";

function fetchUnixSocket(
  socketPath: string,
  path: string,
  method: string = "GET",
): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      socketPath,
      path,
      method,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          if (!data) return resolve(null);
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data); // for non-json responses or empty
          }
        } else {
          reject(new Error(`Docker API error: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.end();
  });
}

export const GET: RequestHandler = async () => {
  try {
    const settings = await getSettings();
    const socketPath =
      (settings.docker_socket_path as string) || "/var/run/docker.sock";

    let rawContainers = [];

    if (socketPath.startsWith("/")) {
      // Unix socket
      rawContainers = await fetchUnixSocket(
        socketPath,
        "/containers/json?all=1",
      );
    } else {
      // TCP URL
      const agent = new Agent({ connect: { rejectUnauthorized: false } });
      let normalizedUrl = socketPath.replace(/\/$/, "");
      const res = await undiciFetch(`${normalizedUrl}/containers/json?all=1`, {
        dispatcher: agent,
      });

      if (!res.ok) {
        return json(
          { error: `Errore TCP Docker: ${res.status}` },
          { status: res.status },
        );
      }
      rawContainers = (await res.json()) as any[];
    }

    // Calculate stats to send to frontend
    const stats = {
      total: rawContainers.length,
      running: 0,
      stopped: 0,
      paused: 0,
    };

    const mappedContainers = rawContainers.map((c: any) => {
      if (c.State === "running") stats.running++;
      else if (c.State === "paused") stats.paused++;
      else stats.stopped++; // exited, created, dead, etc.

      return {
        id: c.Id,
        name:
          c.Names && c.Names.length > 0
            ? c.Names[0].replace(/^\//, "")
            : "Unknown",
        state: c.State,
        status: c.Status,
      };
    });

    return json({ stats, containers: mappedContainers });
  } catch (e: any) {
    console.error("Docker proxy error:", e);
    return json(
      { error: e.message || "Errore di connessione a Docker" },
      { status: 500 },
    );
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin)
    return json({ error: "Non autorizzato" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !["start", "stop", "restart"].includes(action)) {
      return json({ error: "Parametri non validi" }, { status: 400 });
    }

    const settings = await getSettings();
    const socketPath =
      (settings.docker_socket_path as string) || "/var/run/docker.sock";

    if (socketPath.startsWith("/")) {
      await fetchUnixSocket(socketPath, `/containers/${id}/${action}`, "POST");
    } else {
      const agent = new Agent({ connect: { rejectUnauthorized: false } });
      let normalizedUrl = socketPath.replace(/\/$/, "");
      const res = await undiciFetch(
        `${normalizedUrl}/containers/${id}/${action}`,
        {
          method: "POST",
          dispatcher: agent,
        },
      );
      if (!res.ok) {
        return json(
          { error: `Errore comando: ${res.status}` },
          { status: res.status },
        );
      }
    }

    return json({ success: true });
  } catch (e: any) {
    console.error("Docker action error:", e);
    return json(
      { error: e.message || "Errore esecuzione comando" },
      { status: 500 },
    );
  }
};
