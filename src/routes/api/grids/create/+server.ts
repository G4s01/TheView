import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { dashboard_grids } from "$lib/server/db/schema";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, show_header } = await request.json();
    if (!name || typeof name !== "string") {
      return json({ error: "Name is required" }, { status: 400 });
    }

    const result = await db
      .insert(dashboard_grids)
      .values({
        name,
        show_header: show_header !== undefined ? show_header : true,
        position: 999,
      })
      .returning();

    return json({ grid: result[0] });
  } catch (error) {
    console.error("Failed to create grid:", error);
    return json({ error: "Failed to create grid" }, { status: 500 });
  }
};
