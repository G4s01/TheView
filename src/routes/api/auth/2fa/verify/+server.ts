import { json } from "@sveltejs/kit";
import { verifyTOTP } from "@oslojs/otp";
import { decodeBase32IgnorePadding } from "@oslojs/encoding";
import { getSettings, saveSettings } from "$lib/server/settings";
import { generateSessionToken, createSession } from "$lib/server/auth";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
  const { action, code, secret } = await request.json();

  if (action === "setup") {
    if (!locals.isAdmin)
      return json({ error: "Unauthorized" }, { status: 401 });

    try {
      const secretBytes = decodeBase32IgnorePadding(secret);
      const { verifyTOTPWithGracePeriod } = await import("@oslojs/otp");
      const isValid = verifyTOTPWithGracePeriod(secretBytes, 30, 6, code, 2);

      if (!isValid)
        return json(
          { success: false, error: "Codice non valido" },
          { status: 400 },
        );

      const { encryptString } = await import("$lib/server/crypto");
      await saveSettings({
        totp_enabled: true,
        totp_secret: encryptString(secret),
      });

      return json({ success: true });
    } catch (e) {
      return json(
        { success: false, error: "Errore durante la validazione" },
        { status: 500 },
      );
    }
  }

  if (action === "login") {
    const settings = await getSettings();
    if (!settings.totp_enabled || !settings.totp_secret) {
      return json({ error: "2FA not enabled" }, { status: 400 });
    }

    try {
      const { decryptString } = await import("$lib/server/crypto");
      const storedSecret = decryptString(settings.totp_secret);
      const secretBytes = decodeBase32IgnorePadding(storedSecret);

      // Validazione con grace period per evitare problemi di sincronia leggeri
      const { verifyTOTPWithGracePeriod } = await import("@oslojs/otp");
      const isValid = verifyTOTPWithGracePeriod(secretBytes, 30, 6, code, 2);

      if (!isValid)
        return json(
          { success: false, error: "Codice non valido" },
          { status: 400 },
        );

      const token = generateSessionToken();
      const session = await createSession(token);
      const isSecure = env.SECURE_COOKIE === "true";

      cookies.set("admin_session", token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: isSecure,
        expires: session.expiresAt,
      });

      return json({ success: true });
    } catch (e) {
      return json(
        { success: false, error: "Errore durante la validazione" },
        { status: 500 },
      );
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};
