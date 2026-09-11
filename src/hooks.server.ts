import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import { setDefaultResultOrder } from "node:dns";
import { validateSession } from "$lib/server/auth";
import { env } from "$env/dynamic/private";

// Fix per network in Docker (risolve localhost ad IPv4 invece che IPv6)
setDefaultResultOrder("ipv4first");

export const handle: Handle = async ({ event, resolve }) => {
  const sessionToken = event.cookies.get("admin_session");

  if (!sessionToken) {
    event.locals.isAdmin = false;
    event.locals.session = null;
  } else {
    // Gestione transizione se c'è ancora un cookie legacy
    if (sessionToken === "active") {
      event.locals.isAdmin = false;
      event.locals.session = null;
      event.cookies.delete("admin_session", { path: "/" });
    } else {
      const { session } = await validateSession(sessionToken);
      if (session) {
        event.locals.isAdmin = true;
        event.locals.session = session;
        // Estensione del cookie sul client in caso di sessione estesa
        const isSecure = env.SECURE_COOKIE === "true";
        event.cookies.set("admin_session", sessionToken, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: isSecure,
          expires: session.expiresAt,
        });
      } else {
        event.locals.isAdmin = false;
        event.locals.session = null;
        event.cookies.delete("admin_session", { path: "/" });
      }
    }
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
