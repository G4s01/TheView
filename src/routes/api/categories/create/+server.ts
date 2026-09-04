import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.isAdmin) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { name } = await request.json();
		if (!name) return json({ error: 'Missing name' }, { status: 400 });

		const [newCat] = await db.insert(categories).values({ name }).returning();
		return json({ success: true, category: newCat });
	} catch (error) {
		return json({ error: 'Failed to create category' }, { status: 500 });
	}
};
