import { json } from "@sveltejs/kit";
import { Agent, fetch as undiciFetch } from "undici";
import { rewriteUrlForDocker } from "$lib/server/dockerHost";

export async function GET({ url }) {
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return json({ error: "Missing url parameter" }, { status: 400 });
  }

  const start = performance.now();
  let rewrittenUrl = targetUrl;
  try {
    rewrittenUrl = rewriteUrlForDocker(targetUrl);
  } catch (e) {}

  try {
    const agent = new Agent({
      connect: {
        rejectUnauthorized: false,
      },
    });

    let response = await undiciFetch(rewrittenUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
      dispatcher: agent,
    });

    const end = performance.now();

    const isOnline = response.status >= 200 && response.status < 500;

    return json({
      status: isOnline ? "online" : "offline",
      statusCode: response.status,
      responseTimeMs: Math.round(end - start),
    });
  } catch (error) {
    // Avoid doubling the wait time if the service is simply unreachable/timeout
    if (error instanceof Error && error.name === "TimeoutError") {
      const end = performance.now();
      return json({
        status: "offline",
        error: error.message,
        responseTimeMs: Math.round(end - start),
      });
    }

    // Fallback to GET if HEAD fails for some specific web servers that drop connection
    try {
      const agent = new Agent({ connect: { rejectUnauthorized: false } });
      let response = await undiciFetch(rewrittenUrl, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
        dispatcher: agent,
      });
      const end = performance.now();
      const isOnline = response.status >= 200 && response.status < 500;
      return json({
        status: isOnline ? "online" : "offline",
        statusCode: response.status,
        responseTimeMs: Math.round(end - start),
      });
    } catch (fallbackError) {
      const end = performance.now();
      return json({
        status: "offline",
        error:
          fallbackError instanceof Error
            ? fallbackError.message
            : "Unknown error",
        responseTimeMs: Math.round(end - start),
      });
    }
  }
}
