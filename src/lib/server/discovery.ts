import { env } from "$env/dynamic/private";
import http from "http";

export interface DiscoveredService {
  id: string;
  name: string;
  url: string;
  source: "npm" | "docker";
  description?: string;
}

// Interroga l'API di NPM per trovare i proxy hosts
export async function getNpmServices(
  npmUrl?: string,
  email?: string,
  password?: string,
): Promise<DiscoveredService[]> {
  if (!npmUrl || !email || !password) {
    console.log("NPM credentials not provided");
    return [];
  }

  try {
    // 1. Get Token
    const tokenRes = await fetch(`${npmUrl.replace(/\/$/, "")}/api/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, secret: password }),
    });

    if (!tokenRes.ok) {
      console.error("Failed to authenticate with NPM API");
      return [];
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.token;

    // 2. Get Proxy Hosts
    const hostsRes = await fetch(
      `${npmUrl.replace(/\/$/, "")}/api/nginx/proxy-hosts?expand=owner,access_list,certificate`,
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

            services.push({
              id: `docker-${container.Id.substring(0, 12)}`,
              name,
              url: "",
              source: "docker",
              description: container.Image,
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
  npmUrl?: string,
  npmEmail?: string,
  npmPassword?: string,
): Promise<DiscoveredService[]> {
  const [npm, docker] = await Promise.all([
    getNpmServices(npmUrl, npmEmail, npmPassword),
    getDockerServices(),
  ]);

  const all = [...npm, ...docker];

  // Filtra quelli che hanno un URL già presente nel DB
  const normalizedExistingUrls = existingUrls.map((u) => {
    try {
      return new URL(u).hostname.toLowerCase();
    } catch {
      return u.toLowerCase();
    }
  });

  return all.filter((s) => {
    if (!s.url) return true; // Mostra i container Docker senza URL
    try {
      const hostname = new URL(s.url).hostname.toLowerCase();
      return !normalizedExistingUrls.includes(hostname);
    } catch {
      return true;
    }
  });
}
