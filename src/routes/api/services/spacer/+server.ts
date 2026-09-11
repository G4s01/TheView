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
    const { categoryId } = await request.json();
    if (categoryId === undefined) return json({ error: "Missing categoryId" }, { status: 400 });

    const existing = await db
      .select({ position: services.position })
      .from(services)
      .where(eq(services.categoryId, categoryId));
    const maxPos = existing.length > 0 ? Math.max(...existing.map((s) => s.position || 0)) : -1;
    const nextPos = maxPos + 1;

    const [newService] = await db.insert(services).values({
      name: "__SPACER__",
      url: "#",
      categoryId,
      icon: null,
      description: "Spacer fittizio",
      widgetType: "spacer",
      pingEnabled: false,
      dockerImage: null,
      size: "1x1",
      position: nextPos,
    }).returning();

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

    await db.delete(services).where(
      and(
        eq(services.id, parseInt(id.toString())),
        eq(services.widgetType, "spacer")
      )
    );
    return json({ success: true });
  } catch (error) {
    console.error("Failed to delete spacer:", error);
    return json({ error: "Database error" }, { status: 500 });
  }
};
