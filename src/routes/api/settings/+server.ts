import { json } from "@sveltejs/kit";
import { getSettings, saveSettings } from "$lib/server/settings";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.isAdmin) return json({ error: "Unauthorized" }, { status: 401 });
  const settings = getSettings();

  // Rimuovi o maschera i dati sensibili prima di inviarli al client
  const safeSettings = { ...settings };
  if (safeSettings.adminPassword) safeSettings.adminPassword = "********";
  if (safeSettings.npmPassword) safeSettings.npmPassword = "********";
  if (safeSettings.qbit_password) safeSettings.qbit_password = "********";

  return json(safeSettings);
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.isAdmin) return json({ error: "Unauthorized" }, { status: 401 });

  try {
    const newSettings = await request.json();

    // Non sovrascrivere se il client reinvia la maschera
    if (newSettings.adminPassword === "********")
      delete newSettings.adminPassword;
    if (newSettings.npmPassword === "********") delete newSettings.npmPassword;
    if (newSettings.qbit_password === "********")
      delete newSettings.qbit_password;

    // Crittografia/Hash dinamico
    const { hashPassword, encryptString } = await import("$lib/server/crypto");
    if (newSettings.adminPassword) {
      newSettings.adminPassword = hashPassword(newSettings.adminPassword);
    }
    if (newSettings.npmPassword) {
      newSettings.npmPassword = encryptString(newSettings.npmPassword);
    }
    if (newSettings.qbit_password) {
      newSettings.qbit_password = encryptString(newSettings.qbit_password);
    }

    const merged = saveSettings(newSettings);
    return json({ success: true });
  } catch (e) {
    return json({ error: "Failed to save settings" }, { status: 500 });
  }
};
