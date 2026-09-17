import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';

export function useWgEasy() {
	return createQuery(() => ({
		queryKey: ['wgeasy'],
		queryFn: async () => {
			const res = await fetch('/api/widgets/wg-easy');
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || 'Errore recupero Wg-easy');
			}
			return res.json();
		},
		refetchInterval: 3000
	}));
}

export function useWgEasyActions() {
    const queryClient = useQueryClient();
    
    return createMutation(() => ({
        mutationFn: async (params: any) => {
            const res = await fetch('/api/widgets/wg-easy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Errore azione Wg-easy');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wgeasy'] });
        }
    }));
}
