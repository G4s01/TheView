import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";
import { discoverAllServices } from "$lib/server/discovery";
import { getSettings } from "$lib/server/settings";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingServices = await db
      .select({ url: services.url })
      .from(services);
    const existingUrls = existingServices.map((s) => s.url);

    const settings = getSettings();
    const npmUrl = settings.npmUrl;
    const npmEmail = settings.npmEmail;
    const npmPassword = settings.npmPassword;

    const result = await discoverAllServices(
      existingUrls,
      npmUrl,
      npmEmail,
      npmPassword,
    );

    return json(result);
  } catch (error) {
    console.error("Failed to run discovery:", error);
    return json({ error: "Failed to discover services" }, { status: 500 });
  }
};
