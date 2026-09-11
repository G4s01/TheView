import { db } from "$lib/server/db";
import { services, categories } from "$lib/server/db/schema";
import { eq, not } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import { resolveIcon } from "$lib/server/iconResolver";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const allServices = await db.select().from(services);
  const allCategories = await db
    .select()
    .from(categories)
    .where(not(eq(categories.id, -1)))
    .orderBy(categories.position);

  const servicesWithIcons = allServices.map((s) => {
    return {
      ...s,
      iconDetails: resolveIcon(s.icon, s.dockerImage, s.name, s.url),
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
    const categoryIdStr = data.get("categoryId")?.toString();

    if (!name || !url) {
      return fail(400);
    }

    const parsedCatId = parseInt(categoryIdStr || "");
    const categoryId = isNaN(parsedCatId) ? -1 : parsedCatId;
    const icon = data.get("icon")?.toString() || null;
    let iconToSave = icon;
    if (iconToSave && iconToSave.startsWith("/http")) {
      iconToSave = iconToSave.substring(1);
    }
    const description = data.get("description")?.toString() || null;
    let widgetType = data.get("widgetType")?.toString() || null;
    if (widgetType === "none") widgetType = null;
    const pingEnabled = data.get("pingEnabled") === "on";
    const dockerImage = data.get("dockerImage")?.toString() || null;
    const size = (data.get("size")?.toString() || "1x1") as
      | "1x1"
      | "2x1"
      | "2x2"
      | "1x2";

    try {
      const existing = await db
        .select({ position: services.position })
        .from(services)
        .where(eq(services.categoryId, categoryId));
      const maxPos =
        existing.length > 0
          ? Math.max(...existing.map((s) => s.position || 0))
          : -1;
      const nextPos = maxPos + 1;

      await db.insert(services).values({
        name,
        url,
        categoryId,
        icon: iconToSave,
        description,
        widgetType,
        pingEnabled,
        dockerImage,
        size,
        position: nextPos,
      });
      return { success: true };
    } catch (error) {
      console.error(error);
      return fail(500, { error: "Database error while creating service" });
    }
  },

  updateService: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id")?.toString();
    const name = data.get("name")?.toString();
    const url = data.get("url")?.toString();
    const categoryIdStr = data.get("categoryId")?.toString();

    if (!id || !name || !url) {
      return fail(400);
    }

    const parsedCatId = parseInt(categoryIdStr || "");
    const categoryId = isNaN(parsedCatId) ? -1 : parsedCatId;
    console.log("updateService received categoryIdStr:", categoryIdStr, "parsed:", parsedCatId, "final:", categoryId);
    const icon = data.get("icon")?.toString() || null;
    let iconToSave = icon;
    if (iconToSave && iconToSave.startsWith("/http")) {
      iconToSave = iconToSave.substring(1);
    }
    const description = data.get("description")?.toString() || null;
    let widgetType = data.get("widgetType")?.toString() || null;
    if (widgetType === "none") widgetType = null;
    const pingEnabled = data.get("pingEnabled") === "on";
    const dockerImage = data.get("dockerImage")?.toString() || null;
    const size = (data.get("size")?.toString() || "1x1") as
      | "1x1"
      | "2x1"
      | "2x2"
      | "1x2";

    try {
      await db
        .update(services)
        .set({
          name,
          url,
          categoryId,
          icon: iconToSave,
          description,
          widgetType,
          pingEnabled,
          dockerImage,
          size,
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
    const icon = data.get("icon")?.toString() || null;
    let iconToSave = icon;
    if (iconToSave && iconToSave.startsWith("/http")) {
      iconToSave = iconToSave.substring(1);
    }

    if (!name) return fail(400, { error: "Nome categoria mancante" });

    try {
      const allCats = await db.select().from(categories);
      if (allCats.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        return fail(400, { error: "Esiste già una categoria con questo nome" });
      }

      const [newCat] = await db.insert(categories).values({ name, icon: iconToSave }).returning();
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
    const icon = data.get("icon")?.toString() || null;
    let iconToSave = icon;
    if (iconToSave && iconToSave.startsWith("/http")) {
      iconToSave = iconToSave.substring(1);
    }

    if (!id || !name) return fail(400, { error: "Dati mancanti" });

    try {
      const allCats = await db.select().from(categories);
      if (
        allCats.some(
          (c) =>
            c.name.toLowerCase() === name.toLowerCase() &&
            c.id !== parseInt(id),
        )
      ) {
        return fail(400, { error: "Esiste già una categoria con questo nome" });
      }

      await db
        .update(categories)
        .set({ name, icon: iconToSave })
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
      // Imposta i servizi collegati alla categoria fantasma (-1) anziché eliminarli
      await db.update(services).set({ categoryId: -1 }).where(eq(services.categoryId, parseInt(id)));
      await db.delete(categories).where(eq(categories.id, parseInt(id)));
      return { success: true };
    } catch (error) {
      return fail(500, {
        error: "Errore durante l'eliminazione della categoria",
      });
    }
  },
};
