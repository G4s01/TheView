import { createQuery } from "@tanstack/svelte-query";

export function useFilebrowser(serviceId: () => number) {
  return createQuery(() => ({
    queryKey: ["filebrowser", serviceId()],
    queryFn: async () => {
      const res = await fetch(`/api/widgets/filebrowser?id=${serviceId()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore sconosciuto");
      }
      return data;
    },
    refetchInterval: 30000, // 30s polling
  }));
}
