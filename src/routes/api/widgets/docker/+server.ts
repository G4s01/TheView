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
    let rawImages = [];

    if (socketPath.startsWith("/")) {
      // Unix socket
      rawContainers = await fetchUnixSocket(
        socketPath,
        "/containers/json?all=1",
      );
      rawImages = await fetchUnixSocket(socketPath, "/images/json");
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

      const resImg = await undiciFetch(`${normalizedUrl}/images/json`, {
        dispatcher: agent,
      });
      if (resImg.ok) {
        rawImages = (await resImg.json()) as any[];
      }
    }

    // Build map of RepoTag -> ImageId
    const imageTagMap: Record<string, string> = {};
    if (Array.isArray(rawImages)) {
      for (const img of rawImages) {
        if (img.RepoTags && Array.isArray(img.RepoTags)) {
          for (const tag of img.RepoTags) {
            imageTagMap[tag] = img.Id;
          }
        }
      }
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

      let imageTag = c.Image;
      if (!imageTag.includes(":")) imageTag += ":latest";
      // Docker api ImageID sometimes has sha256: prefix, sometimes not. Id from images/json always does.

      let updateAvailable = false;
      const latestImageId = imageTagMap[imageTag];
      if (latestImageId && latestImageId !== c.ImageID) {
        updateAvailable = true;
      }

      return {
        id: c.Id,
        name:
          c.Names && c.Names.length > 0
            ? c.Names[0].replace(/^\//, "")
            : "Unknown",
        image: c.Image,
        state: c.State,
        status: c.Status,
        updateAvailable,
      };
    });

    // Ordiniamo per updateAvailable e poi per nome
    mappedContainers.sort((a: any, b: any) => {
      if (a.updateAvailable && !b.updateAvailable) return -1;
      if (!a.updateAvailable && b.updateAvailable) return 1;
      return a.name.localeCompare(b.name);
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
    const { id, action, image } = body;

    const settings = await getSettings();
    const socketPath =
      (settings.docker_socket_path as string) || "/var/run/docker.sock";

    if (action === "checkUpdates") {
      // Avviamo il pull delle immagini in background, per non bloccare la risposta
      // (potrebbe volerci molto tempo per decine di container)
      // Prendiamo la lista dei container attivi e pulliamo.
      (async () => {
        try {
          let rawContainers = [];
          if (socketPath.startsWith("/")) {
            rawContainers = await fetchUnixSocket(
              socketPath,
              "/containers/json?all=1",
            );
          } else {
            const agent = new Agent({ connect: { rejectUnauthorized: false } });
            let normalizedUrl = socketPath.replace(/\/$/, "");
            const res = await undiciFetch(
              `${normalizedUrl}/containers/json?all=1`,
              { dispatcher: agent },
            );
            if (res.ok) rawContainers = (await res.json()) as any[];
          }

          // Crea un set di immagini uniche
          const imagesToPull = new Set<string>();
          for (const c of rawContainers) {
            let imageTag = c.Image;
            if (!imageTag.includes(":")) imageTag += ":latest";
            imagesToPull.add(imageTag);
          }

          for (const img of imagesToPull) {
            try {
              if (socketPath.startsWith("/")) {
                await fetchUnixSocket(
                  socketPath,
                  `/images/create?fromImage=${encodeURIComponent(img)}`,
                  "POST",
                );
              } else {
                const agent = new Agent({
                  connect: { rejectUnauthorized: false },
                });
                let normalizedUrl = socketPath.replace(/\/$/, "");
                await undiciFetch(
                  `${normalizedUrl}/images/create?fromImage=${encodeURIComponent(img)}`,
                  { method: "POST", dispatcher: agent },
                );
              }
            } catch (e) {
              console.error(`Errore pull immagine ${img}:`, e);
            }
          }
        } catch (err) {
          console.error("Errore background checkUpdates:", err);
        }
      })();

      return json({
        success: true,
        message: "Controllo aggiornamenti avviato in background",
      });
    }

    if (!id || !["start", "stop", "restart"].includes(action)) {
      return json({ error: "Parametri non validi" }, { status: 400 });
    }

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
