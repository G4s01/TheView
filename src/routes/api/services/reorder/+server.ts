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
    const payload = await request.json();
    const { itemsWithPositions, gridId, categoryId } = payload;

    const targetGridId = gridId !== undefined ? gridId : categoryId; // retrocompatibilità durante transizione

    if (Array.isArray(itemsWithPositions)) {
      for (const item of itemsWithPositions) {
        const updateData: any = {};

        // Manteniamo anche position e size per retrocompatibilità temporanea se serve
        if (item.position !== undefined) updateData.position = item.position;
        if (item.size !== undefined) updateData.size = item.size;

        if (targetGridId !== undefined) {
          updateData.grid_id = targetGridId === -1 ? null : targetGridId;
        }

        if (item.x !== undefined) updateData.x = item.x;
        if (item.y !== undefined) updateData.y = item.y;
        if (item.w !== undefined) updateData.w = item.w;
        if (item.h !== undefined) updateData.h = item.h;

        await db
          .update(services)
          .set(updateData)
          .where(eq(services.id, item.id));
      }
    } else {
      return json(
        { error: "Invalid payload, itemsWithPositions is required" },
        { status: 400 },
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error("Failed to reorder services:", error);
    return json({ error: "Failed to reorder services" }, { status: 500 });
  }
};
