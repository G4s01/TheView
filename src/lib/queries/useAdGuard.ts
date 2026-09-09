import {
  createQuery,
  createMutation,
  useQueryClient,
} from "@tanstack/svelte-query";

export function useAdGuardStats() {
  return createQuery(() => ({
    queryKey: ["adguard"],
    queryFn: async () => {
      const res = await fetch("/api/widgets/adguard");
      if (!res.ok) throw new Error("AdGuard API Error");
      return res.json();
    },
    refetchInterval: 10000,
  }));
}

export function useAdGuardToggle() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({
      action,
      duration,
    }: {
      action: "enable" | "disable";
      duration?: number;
    }) => {
      const res = await fetch("/api/widgets/adguard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, duration }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adguard"] });
    },
  }));
}
