import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const finalGridId = data.gridId; // null for Inbox

    let w = 2,
      h = 2;
    if (
      data.widgetType === "qbittorrent" ||
      data.widgetType === "adguard" ||
      data.widgetType === "beszel" ||
      data.widgetType === "wgeasy"
    ) {
      w = 3;
      h = 2;
    } else if (data.widgetType === "clock") {
      w = 2;
      h = 2;
    } else if (data.widgetType === "weather") {
      w = 2;
      h = 2;
    }

    const [newService] = await db
      .insert(services)
      .values({
        name: data.name || "Nuovo Servizio",
        url: data.url || "",
        categoryId: -1, // Use -1 to satisfy constraints safely
        grid_id: finalGridId || null,
        icon: data.icon || null,
        description: data.description || "",
        widgetType: data.widgetType || "none",
        isWidget: true,
        pingEnabled: data.pingEnabled === true,
        dockerImage: data.dockerImage || null,
        size: `gs-${w}x${h}`,
        position: 999,
        w: w,
        h: h,
        x: data.x !== undefined ? data.x : 0,
        y: data.y !== undefined ? data.y : 0,
      })
      .returning();

    return json({ success: true, service: newService });
  } catch (error) {
    console.error("Failed to create service:", error);
    return json({ error: "Database error" }, { status: 500 });
  }
};
