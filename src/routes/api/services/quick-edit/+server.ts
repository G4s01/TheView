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
    const {
      id,
      name,
      url,
      icon,
      description,
      categoryId,
      pingEnabled,
      widgetType,
    } = await request.json();

    if (!id || !name || !url || !categoryId) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    let iconToSave = icon || null;
    if (iconToSave && iconToSave.startsWith("/http")) {
      iconToSave = iconToSave.substring(1);
    }

    await db
      .update(services)
      .set({
        name,
        url,
        icon: iconToSave,
        description: description || null,
        categoryId,
        pingEnabled: pingEnabled ?? true,
        widgetType: widgetType || null,
      })
      .where(eq(services.id, id));

    return json({ success: true });
  } catch (error) {
    console.error("Failed to quick-edit service:", error);
    return json({ error: "Failed to update service" }, { status: 500 });
  }
};
