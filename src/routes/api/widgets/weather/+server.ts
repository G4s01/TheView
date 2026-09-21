import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  try {
    const settings = await getSettings();
    const locationStr = (settings.weather_location as string) || '41.90278,12.49637,Roma'; // Default Rome

    const parts = locationStr.split(',');
    if (parts.length < 3) {
      return json({ error: "Località non valida. Formato errato." }, { status: 400 });
    }

    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    const name = parts.slice(2).join(',').trim();

    // Fetch weather data
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&timezone=auto`);
    if (!weatherRes.ok) { const txt = await weatherRes.text(); throw new Error("Errore API Meteo: " + weatherRes.status + " " + txt); }

    const weatherData = await weatherRes.json();

    return json({
      name,
      current: weatherData.current,
      daily: weatherData.daily,
      hourly: weatherData.hourly
    });
  } catch (e: any) {
    console.error("Weather proxy error:", e);
    return json({ error: e.message || "Errore interno" }, { status: 500 });
  }
};
