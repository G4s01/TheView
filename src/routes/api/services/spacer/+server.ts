import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const finalGridId =
      data.gridId !== undefined ? data.gridId : data.categoryId;

    const [newService] = await db
      .insert(services)
      .values({
        name: "__SPACER__",
        url: "#",
        categoryId: -1,
        grid_id: finalGridId,
        icon: null,
        description: "Spacer fittizio",
        widgetType: "spacer",
        pingEnabled: false,
        dockerImage: null,
        size: "gs-2x2",
        position: 999,
        w: 1,
        h: 1,
        x: data.x !== undefined ? data.x : 0,
        y: data.y !== undefined ? data.y : 0,
      })
      .returning();

    return json({ success: true, service: newService });
  } catch (error) {
    console.error("Failed to create spacer:", error);
    return json({ error: "Database error" }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) return json({ error: "Missing id" }, { status: 400 });

    await db
      .delete(services)
      .where(
        and(
          eq(services.id, parseInt(id.toString())),
          eq(services.widgetType, "spacer"),
        ),
      );
    return json({ success: true });
  } catch (error) {
    console.error("Failed to delete spacer:", error);
    return json({ error: "Database error" }, { status: 500 });
  }
};
