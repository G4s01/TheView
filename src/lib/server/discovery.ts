import { resolveIcon } from "$lib/server/iconResolver";
import { rewriteUrlForDocker } from "$lib/server/dockerHost";
import { env } from "$env/dynamic/private";
import http from "http";

export interface DiscoveredService {
  id: string;
  name: string;
  url: string;
  source: "npm" | "docker" | "npm+docker";
  description?: string;
  pingEnabled?: boolean;
  iconDetails?: any;
  _ips?: string[];
  _ports?: number[];
  _publicPorts?: number[];
  _npmMatch?: string;
  _iconOverride?: string;
  _dockerImage?: string;
}

// Interroga l'API di NPM per trovare i proxy hosts
export async function getNpmServices(
  npmUrl?: string,
  email?: string,
  password?: string,
) {
  if (!npmUrl || !email || !password) {
    return [];
  }

  const { decryptString } = await import("./crypto");
  const plainPassword = decryptString(password);

  try {
    // 1. Get Token
    const tokenRes = await fetch(new URL("/api/tokens", npmUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, secret: plainPassword }),
    });

    if (!tokenRes.ok) {
      console.error("Failed to authenticate with NPM API");
      return [];
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    // 2. Get Proxy Hosts
    const hostsRes = await fetch(
      rewriteUrlForDocker(
        `${npmUrl.replace(/\/$/, "")}/api/nginx/proxy-hosts?expand=owner,access_list,certificate`,
      ),
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!hostsRes.ok) {
      console.error("Failed to fetch proxy hosts from NPM API");
      return [];
    }

    const hosts = await hostsRes.json();

    const services: DiscoveredService[] = [];
    for (const host of hosts) {
      if (host.domain_names && host.domain_names.length > 0) {
        const primaryDomain = host.domain_names[0];
        // Assume https se ha un certificato
        const scheme =
          host.certificate_id && host.certificate_id !== 0 ? "https" : "http";
        services.push({
          id: `npm-${host.id}`,
          name: primaryDomain.split(".")[0],
          url: `${scheme}://${primaryDomain}`,
          source: "npm",
          pingEnabled: true,
          description: `Forward to ${host.forward_host}:${host.forward_port}`,
        });
      }
    }

    return services;
  } catch (error) {
    console.error("Error fetching from NPM:", error);
    return [];
  }
}

// Interroga il socket Docker per i container attivi
export function getDockerServices(): Promise<DiscoveredService[]> {
  return new Promise((resolve) => {
    const options = {
      socketPath: "/var/run/docker.sock",
      path: "/containers/json",
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          console.error("Docker API error:", res.statusCode, data);
          return resolve([]);
        }

        try {
          const containers = JSON.parse(data);
          const services: DiscoveredService[] = [];

          for (const container of containers) {
            let name = container.Names[0] || "";
            if (name.startsWith("/")) name = name.substring(1);

            // Estrai tutti gli IP del container per il merging
            const ips = [];
            if (
              container.NetworkSettings &&
              container.NetworkSettings.Networks
            ) {
              for (const net of Object.values(
                container.NetworkSettings.Networks,
              ) as any[]) {
                if (net.IPAddress) ips.push(net.IPAddress);
              }
            }

            // Estrai porte
            const ports = [];
            const publicPorts = [];
            if (container.Ports) {
              for (const p of container.Ports) {
                if (p.PrivatePort) ports.push(p.PrivatePort);
                if (p.PublicPort) {
                  ports.push(p.PublicPort);
                  publicPorts.push(p.PublicPort);
                }
              }
            }

            // Estrai label per match deterministico esplicito (se presente)
            let npmMatch = "";
            let iconOverride = "";
            if (container.Labels) {
              if (container.Labels["theview.npm"])
                npmMatch = container.Labels["theview.npm"].toLowerCase();
              if (container.Labels["theview.icon"])
                iconOverride = container.Labels["theview.icon"].toLowerCase();
            }

            services.push({
              id: `docker-${container.Id.substring(0, 12)}`,
              name,
              url: "",
              source: "docker",
              pingEnabled: true,
              description: container.Image,
              _ips: ips,
              _ports: ports,
              _publicPorts: publicPorts,
              _npmMatch: npmMatch,
              _iconOverride: iconOverride,
              _dockerImage: container.Image,
            });
          }

          resolve(services);
        } catch (e) {
          console.error("Error parsing Docker JSON:", e);
          resolve([]);
        }
      });
    });

    req.on("error", (e) => {
      console.error("Docker Socket error (is it mounted?):", e.message);
      resolve([]);
    });

    req.end();
  });
}

export async function discoverAllServices(
  existingUrls: string[],
  existingNames: string[],
  npmUrl?: string,
  npmEmail?: string,
  npmPassword?: string,
): Promise<{ services: DiscoveredService[]; npmError?: string }> {
  let npmError: string | undefined = undefined;

  let npm: (DiscoveredService & {
    forwardHost?: string;
    forwardPort?: number | string;
  })[] = [];
  if (npmUrl && npmEmail && npmPassword) {
    try {
      const { decryptString } = await import("./crypto");
      const plainPassword = decryptString(npmPassword);
      const tokenRes = await fetch(
        rewriteUrlForDocker(`${npmUrl.replace(/\/$/, "")}/api/tokens`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identity: npmEmail, secret: plainPassword }),
        },
      );

      if (!tokenRes.ok) {
        npmError = `Authentication failed: ${tokenRes.status} ${tokenRes.statusText}`;
      } else {
        const tokenData = await tokenRes.json();
        const hostsRes = await fetch(
          rewriteUrlForDocker(
            `${npmUrl.replace(/\/$/, "")}/api/nginx/proxy-hosts?expand=owner,access_list,certificate`,
          ),
          { headers: { Authorization: `Bearer ${tokenData.token}` } },
        );

        if (!hostsRes.ok) {
          npmError = `Failed to fetch proxy hosts: ${hostsRes.status}`;
        } else {
          const hosts = await hostsRes.json();
          for (const host of hosts) {
            if (host.domain_names && host.domain_names.length > 0) {
              const primaryDomain = host.domain_names[0];
              const scheme =
                host.certificate_id && host.certificate_id !== 0
                  ? "https"
                  : "http";
              npm.push({
                id: `npm-${host.id}`,
                name: primaryDomain.split(".")[0],
                url: `${scheme}://${primaryDomain}`,
                source: "npm",
                pingEnabled: true,
                description: `Forward to ${host.forward_host}:${host.forward_port}`,
                forwardHost: host.forward_host,
                forwardPort: host.forward_port,
              });
            }
          }
        }
      }
    } catch (e: any) {
      const cause = e.cause ? ` (Cause: ${e.cause.message || e.cause})` : "";
      npmError = `Network error: ${e.message}${cause}`;
      console.error("NPM Fetch Error Details:", e, e.cause);
    }
  }

  const docker = await getDockerServices();

  // Fondere NPM e Docker
  const merged: DiscoveredService[] = [];
  for (const n of npm) {
    const nName = n.name.toLowerCase();
    const dIndex = docker.findIndex((d) => {
      // 0. Match Deterministico Esplicito (via Label Docker)
      if (d._npmMatch && d._npmMatch === nName) return true;

      // 1. Corrispondenza per Hostname o IP interno
      const fHost = (n.forwardHost || "").toLowerCase();
      const dName = d.name.toLowerCase();
      const dImage = (d.description || "").toLowerCase();

      if (dName === fHost || dName === nName) return true;
      if (d._ips && n.forwardHost && d._ips.includes(n.forwardHost))
        return true;

      // 2. Corrispondenza per Porta Pubblica Esterna (Altamente Affidabile)
      // Se NPM sta puntando all'IP del server host anziché all'IP interno del container,
      // la porta forwardata corrisponderà alla porta "pubblica" esposta dal container (es. 0.0.0.0:8080).
      // Poiché su un singolo host Docker le porte pubbliche sono univoche, questo è un match forte.
      if (
        n.forwardPort &&
        d._publicPorts &&
        d._publicPorts.includes(parseInt(n.forwardPort as string))
      ) {
        return true;
      }

      // 3. Corrispondenza per Porta Privata Interna (Richiede verifica incrociata)
      if (
        n.forwardPort &&
        d._ports &&
        d._ports.includes(parseInt(n.forwardPort as string))
      ) {
        // Se la porta corrisponde (es. la classica 80 interna), dobbiamo assicurarci che ci sia almeno
        // una somiglianza nel nome, nell'immagine o nell'host per evitare falsi positivi.
        if (
          dName.includes(nName) ||
          nName.includes(dName) ||
          dName.includes(fHost) ||
          fHost.includes(dName) ||
          dImage.includes(nName) ||
          nName.includes(dImage)
        ) {
          return true;
        }
      }

      // 4. Fallback intelligente per network_mode: host
      // Se il container non ha alcuna porta mappata internamente (spesso accade con network: host),
      // non possiamo fare il match per porta. Ci affidiamo a una somiglianza molto forte del nome.
      if (!d._ports || d._ports.length === 0) {
        if (
          dName.includes(nName) ||
          nName.includes(dName) ||
          dImage.includes(nName)
        ) {
          // Evitiamo falsi positivi su nomi troppo corti
          if (nName.length >= 4) return true;
        }
      }

      // 5. Somiglianza forte finale
      if (dName === `${nName}-1` || dName === `${nName}_1`) return true;

      return false;
    });
    if (dIndex !== -1) {
      const d = docker[dIndex];
      merged.push({
        ...n,
        source: "npm+docker" as any,
        pingEnabled: true,
        description: `${d.description} (via NPM)`,
        _iconOverride: d._iconOverride,
        _dockerImage: d._dockerImage,
      });
      docker.splice(dIndex, 1);
    } else {
      merged.push(n);
    }
  }

  const all = [...merged, ...docker];

  // Filtra quelli che hanno un URL o NOME già presente nel DB
  const normalizedExistingUrls = existingUrls.filter(Boolean).map((u) => {
    try {
      return new URL(u).hostname.toLowerCase();
    } catch {
      return u.toLowerCase();
    }
  });

  const filtered = all.filter((s) => {
    if (existingNames.includes(s.name.toLowerCase())) return false;
    if (!s.url) return true;
    try {
      const hostname = new URL(s.url).hostname.toLowerCase();
      return !normalizedExistingUrls.includes(hostname);
    } catch {
      return true;
    }
  });

  // Popola l'icona usando guess per ogni servizio
  const enriched = filtered.map((s) => {
    let iconDetails = resolveIcon(
      s._iconOverride,
      s._dockerImage,
      s.name,
      s.url
    );

    // Se l'icona trovata è tramite override, teniamo quello come valore salvabile,
    // altrimenti vuoto per farlo dedurre a runtime, o possiamo salvare il nome
    return {
      ...s,
      iconDetails,
      icon: s._iconOverride || null,
    };
  });

  // Ordina i risultati come richiesto: npm+docker (1), npm (2), docker (3)
  enriched.sort((a, b) => {
    const order: { [key: string]: number } = {
      "npm+docker": 1,
      npm: 2,
      docker: 3,
    };
    return order[a.source] - order[b.source];
  });

  return { services: enriched, npmError };
}
