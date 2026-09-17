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
    const { categoryId, gridId } = await request.json();
    const finalGridId = gridId !== undefined ? gridId : categoryId;

    // We can allow finalGridId to be null for the Inbox
    const condition =
      finalGridId === null
        ? eq(services.grid_id, -1) // or however null is handled, but let's just insert
        : eq(services.grid_id, finalGridId);

    const existing =
      finalGridId === null
        ? await db
            .select({ position: services.position })
            .from(services)
            .where(eq(services.categoryId, -1))
        : await db
            .select({ position: services.position })
            .from(services)
            .where(condition);

    const maxPos =
      existing.length > 0
        ? Math.max(...existing.map((s) => s.position || 0))
        : -1;
    const nextPos = maxPos + 1;

    const [newService] = await db
      .insert(services)
      .values({
        name: "__SPACER__",
        url: "#",
        categoryId: -1, // Use -1 to satisfy constraints safely
        grid_id: finalGridId,
        icon: null,
        description: "Spacer fittizio",
        widgetType: "spacer",
        pingEnabled: false,
        dockerImage: null,
        size: "gs-2x2",
        position: nextPos,
        w: 1,
        h: 1,
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
