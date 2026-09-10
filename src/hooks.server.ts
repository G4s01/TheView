import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { setDefaultResultOrder } from "node:dns";

// Fix per network in Docker (risolve localhost ad IPv4 invece che IPv6)
setDefaultResultOrder("ipv4first");

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get("admin_session");

  // Impostiamo isAdmin in event.locals per poterlo leggere ovunque (server-side)
  if (sessionCookie === "active") {
    event.locals.isAdmin = true;
  } else {
    event.locals.isAdmin = false;
  }

  const settings = await getSettings();
  const needsSetup =
    !settings.adminPassword || settings.adminPassword === "admin";

  if (event.url.pathname.startsWith("/setup")) {
    if (!needsSetup) throw redirect(303, "/");
  } else if (needsSetup) {
    // Redirigi automaticamente alla pagina di setup al caricamento della home o admin
    if (event.url.pathname === "/" || event.url.pathname.startsWith("/admin")) {
      throw redirect(303, "/setup");
    }
  }

  // Protezione rotta /admin (tranne le API auth se fossero li sotto, ma sono in /api/auth)
  if (event.url.pathname.startsWith("/admin")) {
    if (needsSetup) {
      throw redirect(303, "/setup");
    }
    if (!event.locals.isAdmin) {
      throw redirect(303, "/"); // Redirige alla home se non si è loggati
    }
  }

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      let transformed = html;
      const theme = settings.theme || "default";
      if (theme !== "default") {
        transformed = transformed.replace(
          '<html lang="en" class="dark">',
          `<html lang="en" class="dark" data-theme="${theme}">`,
        );
      }
      return transformed;
    },
  });
  return response;
};
