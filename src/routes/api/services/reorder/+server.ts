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
    const { orderedIds, itemsWithPositions, categoryId } = payload;

    if (Array.isArray(itemsWithPositions)) {
      for (const item of itemsWithPositions) {
        const updateData: any = { position: item.position };
        if (categoryId !== undefined) {
          updateData.categoryId = categoryId;
        }
        await db
          .update(services)
          .set(updateData)
          .where(eq(services.id, item.id));
      }
    } else if (Array.isArray(orderedIds)) {
      for (let i = 0; i < orderedIds.length; i++) {
        const updateData: any = { position: i };
        if (categoryId !== undefined) {
          updateData.categoryId = categoryId;
        }
        await db
          .update(services)
          .set(updateData)
          .where(eq(services.id, orderedIds[i]));
      }
    } else {
      return json({ error: "Invalid payload" }, { status: 400 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Failed to reorder services:", error);
    return json({ error: "Failed to reorder services" }, { status: 500 });
  }
};
