import { createQuery } from '@tanstack/svelte-query';

export function useBeszel() {
	return createQuery(() => ({
		queryKey: ['beszel'],
		queryFn: async () => {
			const res = await fetch('/api/widgets/beszel');
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || 'Errore nel recupero dei dati Beszel');
			}
			return res.json();
		},
		refetchInterval: 3000,
		refetchOnWindowFocus: true
	}));
}

export function useBeszelContainers(sysIdGetter: () => string | null | undefined) {
	return createQuery(() => ({
		queryKey: ['beszel_containers', sysIdGetter()],
		queryFn: async () => {
			const sysId = sysIdGetter();
			if (!sysId) return null;
			const res = await fetch(`/api/widgets/beszel?sysId=${sysId}`);
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || 'Errore nel recupero dei container');
			}
			return res.json();
		},
		enabled: !!sysIdGetter(),
		refetchInterval: 3000,
		refetchOnWindowFocus: true
	}));
}
