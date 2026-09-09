import { createQuery } from "@tanstack/svelte-query";

export function usePing(
  url: () => string,
  enabled: () => boolean = () => true,
) {
  return createQuery(() => ({
    queryKey: ["ping", url()],
    queryFn: async () => {
      const currentUrl = url();
      const res = await fetch(
        `/api/services/ping?url=${encodeURIComponent(currentUrl)}`,
      );
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    },
    enabled: enabled() && !!url(),
    refetchInterval: 30000,
    staleTime: 10000,
  }));
}
