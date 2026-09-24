import { createQuery } from "@tanstack/svelte-query";

export function usePing(
  id: () => number,
  enabled: () => boolean = () => true,
) {
  return createQuery(() => ({
    queryKey: ["ping", id()],
    queryFn: async () => {
      const currentId = id();
      const res = await fetch(
        `/api/services/ping?id=${currentId}`,
      );
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    },
    enabled: enabled() && !!id(),
    refetchInterval: 30000,
    staleTime: 10000,
  }));
}
