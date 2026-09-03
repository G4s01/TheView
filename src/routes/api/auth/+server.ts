import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export async function POST({ request, cookies }) {
  const body = await request.json();

  const { action, password } = body;

  if (action === "login") {
    const correctPassword = env.ADMIN_PASSWORD || "admin";

    if (password === correctPassword) {
      cookies.set("admin_session", "active", {
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
