import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { pingService } from "$lib/server/ping";

export async function GET() {
  // Fetch solo i servizi che hanno il ping abilitato
  const pingableServices = await db
    .select({
      id: services.id,
      url: services.url,
    })
    .from(services)
    .where(eq(services.pingEnabled, true));

  // Eseguiamo tutti i ping in parallelo
  const pingPromises = pingableServices.map(async (service) => {
    const status = await pingService(service.url);
    return {
      id: service.id,
      ...status,
    };
  });

  const results = await Promise.all(pingPromises);

  // Convertiamo l'array di risultati in un oggetto mappato per ID
  // es: { "1": { isOnline: true, latencyMs: 45 }, "2": { isOnline: false } }
  const statusMap = results.reduce(
    (acc, result) => {
      acc[result.id] = {
        isOnline: result.isOnline,
        latencyMs: result.latencyMs,
      };
      return acc;
    },
    {} as Record<number, { isOnline: boolean; latencyMs?: number }>,
  );

  return json(statusMap);
}
