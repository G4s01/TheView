import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getSettings } from "$lib/server/settings";
import { decryptString } from "$lib/server/crypto";
import { rewriteUrlForDocker } from "$lib/server/dockerHost";
import { fetch as undiciFetch, Agent } from "undici";

export const GET: RequestHandler = async ({ locals, url }) => {
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
    settings["jellyfin_require_auth"] === "true" ||
    settings["jellyfin_require_auth"] === true;
  if (requireAuth && !locals.isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const url = settings.jellyfin_url;
    const encryptedApiKey = settings.jellyfin_api_key;

    if (!url || !encryptedApiKey) {
      return json({ error: "Jellyfin non configurato" }, { status: 400 });
    }

    const apiKey = decryptString(encryptedApiKey);

    const rawTargetUrl = rewriteUrlForDocker(url);
    const targetUrl = rawTargetUrl.endsWith("/")
      ? rawTargetUrl.slice(0, -1)
      : rawTargetUrl;
    const agent = new Agent({ connect: { rejectUnauthorized: false } });

    // 1. Get Sessions (for Now Playing)
    const sessionsRes = await undiciFetch(`${targetUrl}/Sessions`, {
      headers: { Authorization: `MediaBrowser Token="${apiKey}"` },
      dispatcher: agent,
    });

    let nowPlaying = null;

    if (sessionsRes.ok) {
      const sessions = (await sessionsRes.json()) as any[];
      const playingSession = sessions.find((s) => s.NowPlayingItem);

      if (playingSession) {
        const item = playingSession.NowPlayingItem;
        nowPlaying = {
          sessionId: playingSession.Id,
          title: item.Name,
          subtitle: item.SeriesName
            ? `${item.SeriesName} - S${item.ParentIndexNumber}E${item.IndexNumber}`
            : item.ProductionYear
              ? `${item.ProductionYear}`
              : "",
          userName: playingSession.UserName,
          isPaused: playingSession.PlayState?.IsPaused || false,
          positionTicks: playingSession.PlayState?.PositionTicks || 0,
          runTimeTicks: item.RunTimeTicks || 0,
          backdropImageId:
            item.BackdropImageTags && item.BackdropImageTags[0]
              ? item.Id
              : item.ParentBackdropItemId || item.Id,
          posterImageId: item.ImageTags?.Primary
            ? item.Id
            : item.ParentLogoItemId || item.Id,
          type: item.Type,
        };
      }
    }

    // 2. Get Counts (only if nothing is playing)
    let stats = null;
    if (!nowPlaying) {
      const countsRes = await undiciFetch(`${targetUrl}/Items/Counts`, {
        headers: { Authorization: `MediaBrowser Token="${apiKey}"` },
        dispatcher: agent,
      });
      if (countsRes.ok) {
        const counts = (await countsRes.json()) as any;
        stats = {
          movies: counts.MovieCount || 0,
          series: counts.SeriesCount || 0,
          episodes: counts.EpisodeCount || 0,
          songs: counts.SongCount || 0,
        };
      }
    }

    return json({
      nowPlaying,
      stats,
      url: targetUrl,
    });
  } catch (error: any) {
    console.error("Jellyfin API Error:", error);
    return json(
      { error: "Errore di connessione a Jellyfin", details: error.message },
      { status: 500 },
    );
  }
};
