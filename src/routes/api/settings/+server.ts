import { json } from '@sveltejs/kit';
import { getSettings, saveSettings } from '$lib/server/settings';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.isAdmin) return json({ error: 'Unauthorized' }, { status: 401 });
	return json(getSettings());
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.isAdmin) return json({ error: 'Unauthorized' }, { status: 401 });
	
	try {
		const newSettings = await request.json();
		const merged = saveSettings(newSettings);
		return json({ success: true, settings: merged });
	} catch (e) {
		return json({ error: 'Failed to save settings' }, { status: 500 });
	}
};
