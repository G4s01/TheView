import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.isAdmin) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { syncData } = await request.json();
	if (!Array.isArray(syncData)) {
		return json({ error: 'Invalid data' }, { status: 400 });
	}

	try {
		for (let i = 0; i < syncData.length; i++) {
			const item = syncData[i];
			if (!item.name || item.name.trim() === '') continue; // Skip empty names

			if (typeof item.id === 'string' && item.id.startsWith('new_')) {
				await db.insert(categories).values({ name: item.name, position: i });
			} else {
				await db.update(categories)
					.set({ name: item.name, position: i })
					.where(eq(categories.id, parseInt(item.id.toString())));
			}
		}
		return json({ success: true });
	} catch (e) {
		console.error("Categories sync error:", e);
		return json({ error: 'Sync failed' }, { status: 500 });
	}
};
