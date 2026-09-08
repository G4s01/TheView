import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.isAdmin) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { orderedIds } = await request.json();

		if (!Array.isArray(orderedIds)) {
			return json({ error: 'Invalid payload' }, { status: 400 });
		}

		for (let i = 0; i < orderedIds.length; i++) {
			await db.update(categories)
				.set({ position: i })
				.where(eq(categories.id, orderedIds[i]));
		}

		return json({ success: true });
	} catch (error) {
		console.error('Failed to reorder categories:', error);
		return json({ error: 'Failed to reorder categories' }, { status: 500 });
	}
};
