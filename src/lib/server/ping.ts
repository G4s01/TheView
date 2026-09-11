import { rewriteUrlForDocker } from "$lib/server/dockerHost";
import { Agent, fetch as undiciFetch } from "undici";

export async function pingService(
  url: string,
  timeoutMs: number = 3000,
): Promise<{ isOnline: boolean; latencyMs?: number }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const start = Date.now();
  try {
    const agent = new Agent({ connect: { rejectUnauthorized: false } });

    // Try GET instead of HEAD. GET is universally supported and less prone to being dropped by WAFs or reverse proxies.
    // The amount of data transferred for a simple HTML page is negligible for a 30s interval ping.
    const response = await undiciFetch(rewriteUrlForDocker(url), {
      method: "GET",
      signal: controller.signal,
      dispatcher: agent,
    } as any);

    clearTimeout(id);

    if (response.status >= 200 && response.status < 500) {
      return { isOnline: true, latencyMs: Date.now() - start };
    }

    return { isOnline: false };
  } catch (error) {
    clearTimeout(id);
    return { isOnline: false };
  }
}
