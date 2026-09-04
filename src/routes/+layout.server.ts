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

  return {
    categories: categoriesWithCount,
    isAdmin: locals.isAdmin,
  };
}
