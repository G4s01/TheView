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
      .select({ url: services.url, name: services.name })
      .from(services);
    const existingUrls = existingServices.map((s) => s.url);
    const existingNames = existingServices.map((s) => s.name.toLowerCase());

    const settings = await getSettings();
    const npmEnabled =
      settings.npm_enabled === true || settings.npm_enabled === "true";
    const npmUrl = npmEnabled ? settings.npmUrl : undefined;
    const npmEmail = npmEnabled ? settings.npmEmail : undefined;
    const npmPassword = npmEnabled ? settings.npmPassword : undefined;

    const result = await discoverAllServices(
      existingUrls,
      existingNames,
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
