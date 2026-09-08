import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { categories } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name } = await request.json();

    if (!id || !name) {
      return json({ error: "Missing id or name" }, { status: 400 });
    }

    const allCats = await db.select().from(categories);
    if (
      allCats.some(
        (c) =>
          c.name.toLowerCase() === name.toLowerCase() && c.id !== parseInt(id),
      )
    ) {
      return json(
        { error: "Esiste già una categoria con questo nome" },
        { status: 400 },
      );
    }

    await db
      .update(categories)
      .set({ name })
      .where(eq(categories.id, parseInt(id)));

    return json({ success: true });
  } catch (error) {
    console.error("Failed to update category:", error);
    return json({ error: "Failed to update category" }, { status: 500 });
  }
};
