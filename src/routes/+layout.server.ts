import { db } from "$lib/server/db";
import { categories, services } from "$lib/server/db/schema";

export async function load({ locals }) {
  // Fetch categories for the sidebar
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.position);

  const allServices = await db
    .select({ categoryId: services.categoryId })
    .from(services);

  const categoriesWithCount = allCategories.map((c) => {
    const count = allServices.filter((s) => s.categoryId === c.id).length;
    return { ...c, count };
  });

  const { getSettings } = await import("$lib/server/settings");
  const settings = getSettings();
  const needsSetup =
    !settings.adminPassword || settings.adminPassword === "admin";

  return {
    categories: categoriesWithCount,
    isAdmin: locals.isAdmin,
    needsSetup,
  };
}
