import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { hashPassword, verifyPassword } from "$lib/server/crypto";
import {
  generateSessionToken,
  createSession,
  invalidateSession,
} from "$lib/server/auth";
import { env } from "$env/dynamic/private";

// In-memory rate limiting map
const rateLimitMap = new Map<string, { attempts: number; lockUntil: number }>();

export async function POST({ request, cookies, getClientAddress }) {
  let ip = "unknown";
  try {
    ip = getClientAddress();
  } catch (e) {
    // getClientAddress can throw depending on adapter config
  }
  const now = Date.now();

  const body = await request.json();
  const { action, password } = body;
  const isSecure = env.SECURE_COOKIE === "true";
  const cookieName = isSecure ? "__Host-admin_session" : "admin_session";

  if (action === "login") {
    const record = rateLimitMap.get(ip);
    if (record) {
      if (record.lockUntil > now) {
        return json({ error: "Too Many Requests" }, { status: 429 });
      }
      if (record.lockUntil > 0 && record.lockUntil <= now) {
        rateLimitMap.delete(ip);
      }
    }

    const settings = await getSettings();
    const correctPasswordHash = settings.adminPassword;

    let isValid = false;

    if (correctPasswordHash) {
      if (verifyPassword(password, correctPasswordHash)) {
        isValid = true;
      } else {
        const crypto = await import("crypto");
        const oldHash = crypto
          .createHash("sha256")
          .update(password)
          .digest("hex");
        if (oldHash === correctPasswordHash) {
          isValid = true;
          const { saveSettings } = await import("$lib/server/settings");
          await saveSettings({ adminPassword: hashPassword(password) });
        } else if (password === correctPasswordHash) {
          // FALLBACK: La password in settings è ancora in chiaro.
          isValid = true;
          const { saveSettings } = await import("$lib/server/settings");
          await saveSettings({ adminPassword: hashPassword(password) });
        }
      }
    } else {
      isValid = password === "admin";
    }

    if (isValid) {
      rateLimitMap.delete(ip); // Reset su successo
      if (settings.totp_enabled === true) {
        return json({ success: true, require2FA: true });
      }

      const token = generateSessionToken();
      const session = await createSession(token);

      cookies.set(cookieName, token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: isSecure,
        expires: session.expiresAt,
      });
      return json({ success: true });
    } else {
      const rec = rateLimitMap.get(ip) || { attempts: 0, lockUntil: 0 };
      rec.attempts += 1;
      if (rec.attempts >= 5) {
        rec.lockUntil = now + 15 * 60 * 1000; // 15 min lock
      }
      rateLimitMap.set(ip, rec);

      return json(
        { success: false, error: "Invalid password" },
        { status: 401 },
      );
    }
  } else if (action === "logout") {
    let token = cookies.get(cookieName);
    if (!token) token = cookies.get("admin_session"); // Fallback let per logout

    if (token && token !== "active") {
      await invalidateSession(token);
    }
    cookies.delete(cookieName, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: isSecure,
    });
    if (isSecure) {
      cookies.delete("admin_session", { path: "/" });
    }

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

    cookies.set(cookieName, token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: isSecure,
      expires: session.expiresAt,
    });
    return json({ success: true });
  }

  return json({ success: false, error: "Invalid action" }, { status: 400 });
}
