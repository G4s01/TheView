import { json } from '@sveltejs/kit';
import { getSettings } from '$lib/server/settings';
import { decryptString } from '$lib/server/crypto';
import { Agent, fetch as undiciFetch } from 'undici';
import type { RequestHandler } from './$types';

// Cache for JWT token to avoid re-authenticating every 3 seconds
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const agent = new Agent({
	connect: {
		rejectUnauthorized: false
	}
});

export const GET: RequestHandler = async ({ url }) => {
	const settings = await getSettings();
	const beszel_url = settings.beszel_url as string;
	const beszel_username = settings.beszel_username as string;
	const encryptedPassword = settings.beszel_password as string;

	if (!beszel_url || !beszel_username || !encryptedPassword) {
		return json({ error: 'Configurazione Beszel mancante' }, { status: 400 });
	}

	let password = '';
	try {
		password = decryptString(encryptedPassword);
	} catch (e) {
		return json({ error: 'Errore decrittazione credenziali Beszel' }, { status: 500 });
	}

	let normalizedUrl = beszel_url.replace(/\/$/, '');
	if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
		normalizedUrl = 'https://' + normalizedUrl;
	}
	
	try {
		// 1. Authenticate if no valid token
		if (!cachedToken || !tokenExpiry || Date.now() > tokenExpiry) {
			let authRes = await undiciFetch(`${normalizedUrl}/api/admins/auth-with-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ identity: beszel_username, password }),
				dispatcher: agent
			});

			// If admin auth fails, try user auth (PocketBase collections)
			if (!authRes.ok) {
				authRes = await undiciFetch(`${normalizedUrl}/api/collections/users/auth-with-password`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ identity: beszel_username, password }),
					dispatcher: agent
				});
			}

			if (!authRes.ok) {
				return json({ error: 'Autenticazione Beszel fallita. Controlla URL, Email o Password.' }, { status: authRes.status });
			}

			const authData = await authRes.json() as any;
			cachedToken = authData.token;
			// Pocketbase token typically expires in 14 days, but let's refresh every 24h just in case
			tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); 
		}

		// Se è richiesto un nodo specifico, recuperiamo i container
		const sysId = url.searchParams.get('sysId');
		if (sysId) {
			const statsRes = await undiciFetch(`${normalizedUrl}/api/collections/container_stats/records?filter=system='${sysId}'&sort=-created&perPage=50`, {
				headers: { 'Authorization': `Bearer ${cachedToken}` },
				dispatcher: agent
			});
			if (!statsRes.ok) return json({ error: 'Recupero stats container fallito' }, { status: statsRes.status });
			return json(await statsRes.json());
		}

		// Altrimenti recuperiamo tutti i sistemi (Overview)
		const systemsRes = await undiciFetch(`${normalizedUrl}/api/collections/systems/records?perPage=500`, {
			headers: { 'Authorization': `Bearer ${cachedToken}` },
			dispatcher: agent
		});

		if (!systemsRes.ok) {
			if (systemsRes.status === 401) {
				cachedToken = null;
			}
			return json({ error: 'Recupero sistemi fallito' }, { status: systemsRes.status });
		}

		const systemsData = await systemsRes.json();
		return json(systemsData);

	} catch (e: any) {
		return json({ error: 'Errore di connessione a Beszel', details: e.message }, { status: 500 });
	}
};
