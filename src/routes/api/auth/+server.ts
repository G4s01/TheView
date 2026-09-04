import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";

export async function POST({ request, cookies }) {
  const body = await request.json();
  const { action, password } = body;

  if (action === "login") {
    const settings = getSettings();
    const correctPassword = settings.adminPassword || "admin";

    if (password === correctPassword) {
      cookies.set("admin_session", "active", {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: false, // Serve a permettere il login su IP HTTP locale senza SSL
        maxAge: 60 * 60 * 24 * 7, // 1 settimana
      });
      return json({ success: true });
    } else {
      return json(
        { success: false, error: "Invalid password" },
        { status: 401 },
      );
    }
  } else if (action === "logout") {
    cookies.delete("admin_session", { path: "/", secure: false });
    return json({ success: true });
  } else if (action === "setup") {
    const settings = getSettings();
    const needsSetup =
      !settings.adminPassword || settings.adminPassword === "admin";
    if (!needsSetup)
      return json({ error: "Setup already complete" }, { status: 403 });

    if (!password || password.length < 4)
      return json({ error: "Password too short" }, { status: 400 });

    const { saveSettings } = await import("$lib/server/settings");
    saveSettings({ adminPassword: password });

    cookies.set("admin_session", "active", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
    });
    return json({ success: true });
  }

  return json({ success: false, error: "Invalid action" }, { status: 400 });
}
