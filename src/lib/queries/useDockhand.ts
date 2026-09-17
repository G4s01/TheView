import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';

export function useDockhand() {
	return createQuery(() => ({
		queryKey: ['dockhand'],
		queryFn: async () => {
			const res = await fetch('/api/widgets/dockhand');
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || 'Errore recupero Dockhand');
			}
			return res.json();
		},
		refetchInterval: 3000
	}));
}

export function useDockhandActions() {
    const queryClient = useQueryClient();
    
    return createMutation(() => ({
        mutationFn: async (params: { id: string; action: string; payload?: any }) => {
            const res = await fetch('/api/widgets/dockhand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Errore azione Dockhand');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dockhand'] });
        }
    }));
}
