import { createQuery } from "@tanstack/svelte-query";

export function useFilebrowser() {
  return createQuery(() => ({
    queryKey: ["filebrowser"],
    queryFn: async () => {
      const res = await fetch("/api/widgets/filebrowser");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Errore sconosciuto");
      }
      return data;
    },
    refetchInterval: 30000, // 30s polling
  }));
}
