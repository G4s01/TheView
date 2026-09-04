import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { services } from '$lib/server/db/schema';
import { discoverAllServices } from '$lib/server/discovery';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.isAdmin) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const existingServices = await db.select({ url: services.url }).from(services);
		const existingUrls = existingServices.map(s => s.url);

		const discovered = await discoverAllServices(existingUrls);

		return json({ services: discovered });
	} catch (error) {
		console.error('Failed to run discovery:', error);
		return json({ error: 'Failed to discover services' }, { status: 500 });
	}
};
