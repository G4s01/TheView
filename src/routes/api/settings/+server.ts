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
  if (safeSettings.totp_secret) delete safeSettings.totp_secret; // Never send TOTP secret to frontend
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

    // Secure actions: se 2FA è attiva, le azioni sensibili richiedono otpCode
    const currentSettings = await getSettings();
    const is2FAActive =
      currentSettings.totp_enabled === "true" ||
      currentSettings.totp_enabled === true;

    if (is2FAActive) {
      const isSensitiveAction =
        newSettings.adminPassword ||
        newSettings.totp_enabled === false ||
        newSettings.totp_enabled === "false";
      if (isSensitiveAction) {
        const otpCode = newSettings.otpCode;
        if (!otpCode) {
          return json({ error: "Codice OTP mancante." }, { status: 400 });
        }
        const secret = currentSettings.totp_secret;
        if (!secret) {
          return json({ error: "Errore interno 2FA." }, { status: 500 });
        }
        const { verifyTOTPWithGracePeriod } = await import("@oslojs/otp");
        const { decodeBase32IgnorePadding } = await import("@oslojs/encoding");
        const { decryptString } = await import("$lib/server/crypto");

        const decryptedSecret = decryptString(secret as string);
        try {
          const key = decodeBase32IgnorePadding(decryptedSecret);
          const isValid = verifyTOTPWithGracePeriod(key, 30, 6, otpCode, 2);
          if (!isValid) {
            return json(
              { error: "Codice OTP non valido o scaduto." },
              { status: 400 },
            );
          }
        } catch (e) {
          return json(
            { error: "Errore nella validazione TOTP." },
            { status: 500 },
          );
        }
      }
    }

    // Rimuovi otpCode dal payload per non salvarlo nel database KV
    if (newSettings.otpCode !== undefined) {
      delete newSettings.otpCode;
    }

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

    if (newSettings.enableCategories !== undefined) {
      const currentEnable = currentSettings.enableCategories !== false;
      const newEnable = newSettings.enableCategories !== false;
      
      if (currentEnable !== newEnable) {
        const { db } = await import("$lib/server/db");
        const { services, categories } = await import("$lib/server/db/schema");
        const { eq } = await import("drizzle-orm");
        
        const allServices = await db.select().from(services);
        const allCats = await db.select().from(categories);
        const catIds = [...allCats.map(c => c.id), -1];

        for (const catId of catIds) {
           const catServices = allServices.filter(s => s.categoryId === catId);
           catServices.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
           for (let i = 0; i < catServices.length; i++) {
             await db.update(services)
               .set({ size: '1x1', position: i })
               .where(eq(services.id, catServices[i].id));
           }
        }
      }
    }

    const merged = await saveSettings(newSettings);
    return json({ success: true });
  } catch (e) {
    return json({ error: "Failed to save settings" }, { status: 500 });
  }
};
