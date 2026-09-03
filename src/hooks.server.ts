import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get("admin_session");

  // Impostiamo isAdmin in event.locals per poterlo leggere ovunque (server-side)
  if (sessionCookie === "active") {
    event.locals.isAdmin = true;
  } else {
    event.locals.isAdmin = false;
  }

  // Protezione rotta /admin (tranne le API auth se fossero li sotto, ma sono in /api/auth)
  if (event.url.pathname.startsWith("/admin")) {
    if (!event.locals.isAdmin) {
      throw redirect(303, "/"); // Redirige alla home se non si è loggati
    }
  }

  const response = await resolve(event);
  return response;
};
