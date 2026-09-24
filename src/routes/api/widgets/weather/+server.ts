import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  const serviceId = url.searchParams.get("id");
  if (!serviceId)
    return new Response("Bad Request: missing id", { status: 400 });

  const serviceIdParsed = parseInt(serviceId, 10);
  if (isNaN(serviceIdParsed))
    return new Response("Bad Request: invalid id", { status: 400 });

  const service = await db
    .select()
    .from(services)
    .where(eq(services.id, serviceIdParsed))
    .get();
  if (!service)
    return new Response("Not Found: service does not exist", { status: 404 });

  const settings = await getSettings();
  const requireAuth =
    settings["weather_require_auth"] === "true" ||
    settings["weather_require_auth"] === true;
  if (requireAuth && !locals.isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const locationStr =
      (settings.weather_location as string) || "41.90278,12.49637,Roma"; // Default Rome

    const parts = locationStr.split(",");
    if (parts.length < 3) {
      return json(
        { error: "Località non valida. Formato errato." },
        { status: 400 },
      );
    }

    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    const name = parts.slice(2).join(",").trim();

    // Fetch weather data
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&timezone=auto`,
    );
    if (!weatherRes.ok) {
      const txt = await weatherRes.text();
      throw new Error("Errore API Meteo: " + weatherRes.status + " " + txt);
    }

    const weatherData = await weatherRes.json();

    return json({
      name,
      current: weatherData.current,
      daily: weatherData.daily,
      hourly: weatherData.hourly,
    });
  } catch (e: any) {
    console.error("Weather proxy error:", e);
    return json({ error: e.message || "Errore interno" }, { status: 500 });
  }
};
