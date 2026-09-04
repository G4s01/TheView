import { db } from "$lib/server/db";
import { services, categories } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import { getIconDetails } from "$lib/server/icons";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const allServices = await db.select().from(services);
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.position);

  const servicesWithIcons = allServices.map((s) => {
    return {
      ...s,
      iconDetails: s.icon ? getIconDetails(s.icon) : null,
    };
  });

  return {
    services: servicesWithIcons,
    categories: allCategories,
  };
};

export const actions: Actions = {
  createService: async ({ request }) => {
    const data = await request.formData();
    const name = data.get("name")?.toString();
    const url = data.get("url")?.toString();
    let categoryIdStr = data.get("categoryId")?.toString();

    if (!name || !url) {
      return fail(400, { error: "Missing required fields" });
    }

    let categoryId: number;
    if (!categoryIdStr) {
      const [newCat] = await db
        .insert(categories)
        .values({ name: "Generale" })
        .returning();
      categoryId = newCat.id;
    } else {
      categoryId = parseInt(categoryIdStr);
    }

    const icon = data.get("icon")?.toString() || null;
    const description = data.get("description")?.toString() || null;
    const widgetType = data.get("widgetType")?.toString() || null;
    const pingEnabled = data.get("pingEnabled") === "on";

    try {
      await db.insert(services).values({
        name,
        url,
        categoryId,
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

  updateService: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id")?.toString();
    const name = data.get("name")?.toString();
    const url = data.get("url")?.toString();
    let categoryIdStr = data.get("categoryId")?.toString();

    if (!id || !name || !url) {
      return fail(400, { error: "Missing required fields" });
    }

    let categoryId: number;
    if (!categoryIdStr) {
      const [newCat] = await db
        .insert(categories)
        .values({ name: "Generale" })
        .returning();
      categoryId = newCat.id;
    } else {
      categoryId = parseInt(categoryIdStr);
    }

    const icon = data.get("icon")?.toString() || null;
    const description = data.get("description")?.toString() || null;
    const widgetType = data.get("widgetType")?.toString() || null;
    const pingEnabled = data.get("pingEnabled") === "on";

    try {
      await db
        .update(services)
        .set({
          name,
          url,
          categoryId,
          icon,
          description,
          widgetType,
          pingEnabled,
        })
        .where(eq(services.id, parseInt(id)));
      return { success: true };
    } catch (error) {
      return fail(500, { error: "Database error while updating service" });
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

  createCategory: async ({ request }) => {
    const data = await request.formData();
    const name = data.get("name")?.toString();

    if (!name) return fail(400, { error: "Nome categoria mancante" });

    try {
      const [newCat] = await db.insert(categories).values({ name }).returning();
      return { success: true, category: newCat };
    } catch (error) {
      return fail(500, {
        error: "Errore durante la creazione della categoria",
      });
    }
  },

  updateCategory: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id")?.toString();
    const name = data.get("name")?.toString();

    if (!id || !name) return fail(400, { error: "Dati mancanti" });

    try {
      await db
        .update(categories)
        .set({ name })
        .where(eq(categories.id, parseInt(id)));
      return { success: true };
    } catch (error) {
      return fail(500, {
        error: "Errore durante l'aggiornamento della categoria",
      });
    }
  },

  deleteCategory: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id")?.toString();

    if (!id) return fail(400, { error: "ID mancante" });

    try {
      // SvelteKit form actions. SQLite non supporta CASCADE di default o potremmo avere foreign key contraints.
      // E' meglio eliminare anche i servizi figli, oppure potremmo avvisare l'utente prima (nella UI).
      // Per semplicità eliminiamo i servizi collegati.
      await db.delete(services).where(eq(services.categoryId, parseInt(id)));
      await db.delete(categories).where(eq(categories.id, parseInt(id)));
      return { success: true };
    } catch (error) {
      return fail(500, {
        error: "Errore durante l'eliminazione della categoria",
      });
    }
  },
};
