import { db } from "$lib/server/db";
import { categories } from "$lib/server/db/schema";

export async function load() {
  const allCategories = await db.select().from(categories);

  return {
    categories: allCategories,
  };
}
