import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { dashboard_grids } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, show_header } = await request.json();

    if (!id) return json({ error: "ID is required" }, { status: 400 });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (show_header !== undefined) updateData.show_header = show_header;

    await db
      .update(dashboard_grids)
      .set(updateData)
      .where(eq(dashboard_grids.id, id));

    return json({ success: true });
  } catch (error) {
    console.error("Failed to edit grid:", error);
    return json({ error: "Failed to edit grid" }, { status: 500 });
  }
};
