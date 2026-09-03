import { db } from "$lib/server/db";
import { services, categories } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const allServices = await db.select().from(services);
  const allCategories = await db.select().from(categories);

  return {
    services: allServices,
    categories: allCategories,
  };
};

export const actions: Actions = {
  createService: async ({ request }) => {
    const data = await request.formData();
    const name = data.get("name")?.toString();
    const url = data.get("url")?.toString();
    const categoryId = data.get("categoryId")?.toString();

    if (!name || !url || !categoryId) {
      return fail(400, { error: "Missing required fields" });
    }

    const icon = data.get("icon")?.toString() || null;
    const description = data.get("description")?.toString() || null;
    const widgetType = data.get("widgetType")?.toString() || null;
    const pingEnabled = data.get("pingEnabled") === "on";

    try {
      await db.insert(services).values({
        name,
        url,
        categoryId: parseInt(categoryId),
        icon,
        description,
        widgetType,
        pingEnabled,
      });
      return { success: true };
    } catch (error) {
      return fail(500, { error: "Database error while creating service" });
    }
  },

  deleteService: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id")?.toString();

    if (!id) return fail(400, { error: "Missing ID" });

    try {
      await db.delete(services).where(eq(services.id, parseInt(id)));
      return { success: true };
    } catch (error) {
      return fail(500, { error: "Database error while deleting service" });
    }
  },
};
