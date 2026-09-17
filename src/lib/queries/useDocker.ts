import {
  createQuery,
  createMutation,
  useQueryClient,
} from "@tanstack/svelte-query";

export function useDocker() {
  return createQuery(() => ({
    queryKey: ["docker_stats"],
    queryFn: async () => {
      const res = await fetch("/api/widgets/docker");
      if (!res.ok) {
        let msg = "Errore di connessione";
        try {
          const data = await res.json();
          if (data.error) msg = data.error;
        } catch (e) {}
        throw new Error(msg);
      }
      return await res.json();
    },
    refetchInterval: 5000,
    retry: 1,
  }));
}

export function useDockerActions() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const res = await fetch("/api/widgets/docker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) {
        let msg = "Errore esecuzione comando";
        try {
          const data = await res.json();
          if (data.error) msg = data.error;
        } catch (e) {}
        throw new Error(msg);
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docker_stats"] });
    },
  }));
}
