import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { sign } from "jsonwebtoken";

export async function POST({ request, cookies }) {
  const body = await request.json();

  const { action, password } = body;

  if (action === "login") {
    const settings = getSettings();
    const correctPassword = settings.adminPassword || "admin";

    if (password === correctPassword) {
      const secret = "g4s-theview-super-secret-key-123";
      const token = sign({ role: "admin" }, secret, { expiresIn: "7d" });

      cookies.set("admin_session", token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
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
    cookies.delete("admin_session", { path: "/" });
    return json({ success: true });
  }

  return json({ success: false, error: "Invalid action" }, { status: 400 });
}
