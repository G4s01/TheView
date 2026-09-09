import { json } from "@sveltejs/kit";
import { getSettings, saveSettings } from "$lib/server/settings";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.isAdmin) return json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings();

  // Rimuovi o maschera i dati sensibili prima di inviarli al client
  const safeSettings = { ...settings };
  // Decrypt passwords for the admin client
  const { decryptString } = await import("$lib/server/crypto");
  if (safeSettings.adminPassword) delete safeSettings.adminPassword; // Never send admin hash
  if (safeSettings.npmPassword)
    safeSettings.npmPassword = decryptString(safeSettings.npmPassword);
  if (safeSettings.qbit_password)
    safeSettings.qbit_password = decryptString(safeSettings.qbit_password);
  if (safeSettings.adguard_password)
    safeSettings.adguard_password = decryptString(
      safeSettings.adguard_password,
    );

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
    if (newSettings.adguard_password === "********")
      delete newSettings.adguard_password;

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
    if (newSettings.adguard_password) {
      newSettings.adguard_password = encryptString(
        newSettings.adguard_password,
      );
    }

    const merged = await saveSettings(newSettings);
    return json({ success: true });
  } catch (e) {
    return json({ error: "Failed to save settings" }, { status: 500 });
  }
};
