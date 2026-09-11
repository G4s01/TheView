import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { hashPassword, verifyPassword } from "$lib/server/crypto";
import {
  generateSessionToken,
  createSession,
  invalidateSession,
} from "$lib/server/auth";
import { env } from "$env/dynamic/private";

export async function POST({ request, cookies }) {
  const body = await request.json();
  const { action, password } = body;
  const isSecure = env.SECURE_COOKIE === "true";

  if (action === "login") {
    const settings = await getSettings();
    const correctPasswordHash = settings.adminPassword;

    let isValid = false;

    if (correctPasswordHash) {
      if (verifyPassword(password, correctPasswordHash)) {
        isValid = true;
      } else if (password === correctPasswordHash) {
        // FALLBACK: La password in settings è ancora in chiaro.
        isValid = true;
        const { saveSettings } = await import("$lib/server/settings");
        await saveSettings({ adminPassword: hashPassword(password) });
      }
    } else {
      isValid = password === "admin";
    }

    if (isValid) {
      if (settings.totp_enabled === true) {
        return json({ success: true, require2FA: true });
      }

      const token = generateSessionToken();
      const session = await createSession(token);

      cookies.set("admin_session", token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: isSecure,
        expires: session.expiresAt,
      });
      return json({ success: true });
    } else {
      return json(
        { success: false, error: "Invalid password" },
        { status: 401 },
      );
    }
  } else if (action === "logout") {
    const token = cookies.get("admin_session");
    if (token && token !== "active") {
      await invalidateSession(token);
    }
    cookies.delete("admin_session", { path: "/", secure: isSecure });

    // Pulizia icone in background
    import("$lib/server/icons")
      .then(({ cleanOrphanIcons }) => cleanOrphanIcons().catch(console.error))
      .catch(console.error);

    return json({ success: true });
  } else if (action === "setup") {
    const settings = await getSettings();
    const needsSetup = !settings.adminPassword;
    if (!needsSetup)
      return json({ error: "Setup already complete" }, { status: 403 });

    if (!password || password.length < 4)
      return json({ error: "Password too short" }, { status: 400 });

    const { saveSettings } = await import("$lib/server/settings");
    await saveSettings({ adminPassword: hashPassword(password) });

    const token = generateSessionToken();
    const session = await createSession(token);

    cookies.set("admin_session", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      expires: session.expiresAt,
    });
    return json({ success: true });
  }

  return json({ success: false, error: "Invalid action" }, { status: 400 });
}
