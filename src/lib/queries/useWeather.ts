import { createQuery } from '@tanstack/svelte-query';

export function useWeather() {
  return createQuery(() => ({
    queryKey: ['weather'],
    queryFn: async () => {
      const res = await fetch('/api/widgets/weather');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore sconosciuto');
      }
      return data;
    },
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  }));
}
