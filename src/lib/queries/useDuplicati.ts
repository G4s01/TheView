import {
  createQuery,
  createMutation,
  useQueryClient,
} from "@tanstack/svelte-query";

export function useDuplicati(serviceId: () => number) {
  return createQuery(() => ({
    queryKey: ["duplicati_status", serviceId()],
    queryFn: async () => {
      const res = await fetch(`/api/widgets/duplicati?id=${serviceId()}`);
      if (!res.ok) {
        let msg = "Errore di connessione";
        try {
          const data = await res.json();
          if (data.error) {
            msg = data.error;
            if (data.debug) {
              console.error("Duplicati Debug Info:", data.debug);
              msg += ` (Status: ${data.debug.status || "N/A"})`;
            }
          }
        } catch (e) {}
        throw new Error(msg);
      }
      return await res.json();
    },
    refetchInterval: 3000,
    retry: 1,
  }));
}

export function useDuplicatiActions() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/widgets/duplicati", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Errore durante l'azione Duplicati");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duplicati_status"] });
    },
  }));
}
