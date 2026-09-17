import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { dashboard_grids, services } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) return json({ error: "ID is required" }, { status: 400 });

    // Orphan the services instead of deleting them (they will go to Inbox)
    await db
      .update(services)
      .set({ grid_id: null, categoryId: null })
      .where(eq(services.grid_id, id));
    // Also update any services strictly tied to categoryId just in case
    await db
      .update(services)
      .set({ grid_id: null, categoryId: null })
      .where(eq(services.categoryId, id));

    await db.delete(dashboard_grids).where(eq(dashboard_grids.id, id));

    return json({ success: true });
  } catch (error) {
    console.error("Failed to delete grid:", error);
    return json({ error: "Failed to delete grid" }, { status: 500 });
  }
};
