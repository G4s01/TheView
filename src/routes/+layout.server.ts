import { db } from "$lib/server/db";
import { categories } from "$lib/server/db/schema";

export async function load({ locals }) {
	// Fetch categories for the sidebar
	const allCategories = await db.select().from(categories);
	
	return {
		categories: allCategories,
		isAdmin: locals.isAdmin
	};
}
