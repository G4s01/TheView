import { rewriteUrlForDocker } from "$lib/server/dockerHost";
import { Agent } from "undici";
export async function pingService(
  url: string,
  timeoutMs: number = 3000,
): Promise<{ isOnline: boolean; latencyMs?: number }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const start = Date.now();
  try {
    const agent = new Agent({ connect: { rejectUnauthorized: false } });

    // Preferire richieste HEAD per risparmiare banda e risorse
    const response = await fetch(rewriteUrlForDocker(url), {
      method: "HEAD",
      signal: controller.signal,
      dispatcher: agent,
    } as any);

    clearTimeout(id);

    // Un servizio è online se risponde con 2xx, 3xx (redirect), e perfino 401/403 (significa che c'è un server web che risponde, ma l'endpoint richiede auth).
    if (response.status >= 200 && response.status < 500) {
      return { isOnline: true, latencyMs: Date.now() - start };
    }

    return { isOnline: false };
  } catch (error) {
    clearTimeout(id);

    // Fallback su GET se HEAD non è supportato (alcuni server web droppano HEAD)
    if (error instanceof Error && error.message.includes("HEAD")) {
      // omit fallback for brevity in this first iteration
    }

    return { isOnline: false };
  }
}
