import { json } from '@sveltejs/kit';
import { getIconsList } from '$lib/server/icons-cache';

export async function GET() {
    const icons = await getIconsList();
    return json({ icons });
}
