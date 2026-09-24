import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";

export async function GET() {
  const settings = await getSettings();
  return json({
    adminPassword: settings.adminPassword,
    needsSetup: !settings.adminPassword || settings.adminPassword === "admin"
  });
}
