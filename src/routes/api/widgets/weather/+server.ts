import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settings";
import type { RequestHandler } from "./$types";

let cachedCoords: { location: string; lat: number; lon: number; name: string } | null = null;

export const GET: RequestHandler = async () => {
  try {
    const settings = await getSettings();
    const location = settings.weather_location as string;

    if (!location) {
      return json({ error: "Località non configurata. Impostala nelle opzioni." }, { status: 400 });
    }

    let lat: number, lon: number, name: string;

    // Check if we need to geocode
    if (cachedCoords && cachedCoords.location === location.toLowerCase().trim()) {
      lat = cachedCoords.lat;
      lon = cachedCoords.lon;
      name = cachedCoords.name;
    } else {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=it&format=json`);
      if (!geoRes.ok) throw new Error("Errore durante la geolocalizzazione");
      
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        return json({ error: "Località non trovata." }, { status: 404 });
      }

      lat = geoData.results[0].latitude;
      lon = geoData.results[0].longitude;
      name = geoData.results[0].name;

      cachedCoords = { location: location.toLowerCase().trim(), lat, lon, name };
    }

    // Fetch weather data
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
    if (!weatherRes.ok) throw new Error("Errore durante il recupero del meteo");

    const weatherData = await weatherRes.json();

    return json({
      name,
      current: weatherData.current,
      daily: weatherData.daily,
    });
  } catch (e: any) {
    console.error("Weather proxy error:", e);
    return json({ error: e.message || "Errore interno" }, { status: 500 });
  }
};
