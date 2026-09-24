import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';

export function useJellyfin(serviceId: () => number) {
	return createQuery(() => ({
		queryKey: ["jellyfin", serviceId()],
		queryFn: async () => {
			const res = await fetch(`/api/widgets/jellyfin?id=${serviceId()}`);
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.error || 'Errore fetch Jellyfin');
			}
			return res.json();
		},
		refetchInterval: 5000, // Fast polling for progress bar
		retry: 1
	}));
}

