import { json } from "@sveltejs/kit";
import { Agent, fetch as undiciFetch } from "undici";
import { rewriteUrlForDocker } from "$lib/server/dockerHost";
import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET({ url }) {
  const serviceIdStr = url.searchParams.get("id");

  if (!serviceIdStr) {
    return json({ error: "Missing id parameter" }, { status: 400 });
  }

  const serviceId = parseInt(serviceIdStr, 10);
  if (isNaN(serviceId)) {
    return json({ error: "Invalid id parameter" }, { status: 400 });
  }

  // Fetch the real URL from the database
  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, serviceId));

  if (!service || !service.url) {
    return json({ error: "Service not found or no URL" }, { status: 404 });
  }

  const targetUrl = service.url;

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
