import {
  createQuery,
  createMutation,
  useQueryClient,
} from "@tanstack/svelte-query";

export function useQbittorrent(enabled: () => boolean = () => true) {
  return createQuery(() => ({
    queryKey: ["qbittorrent"],
    queryFn: async () => {
      const res = await fetch("/api/widgets/qbittorrent");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch qBittorrent data");
      }
      return res.json();
    },
    enabled: enabled(),
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
    staleTime: 1500,
  }));
}

export function useQbittorrentPause() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({ hash }: { hash: string }) => {
      const res = await fetch("/api/widgets/qbittorrent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash, action: "pause" }),
      });
      if (!res.ok) throw new Error("Pause failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qbittorrent"] });
    },
  }));
}

export function useQbittorrentResume() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({ hash }: { hash: string }) => {
      const res = await fetch("/api/widgets/qbittorrent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash, action: "resume" }),
      });
      if (!res.ok) throw new Error("Resume failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qbittorrent"] });
    },
  }));
}

export function useQbittorrentDelete() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({ hash }: { hash: string }) => {
      const res = await fetch("/api/widgets/qbittorrent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash, action: "delete" }),
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qbittorrent"] });
    },
  }));
}

export function useQbittorrentAdd() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({ formData }: { formData: FormData }) => {
      formData.append("action", "add");
      const res = await fetch("/api/widgets/qbittorrent", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Add failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qbittorrent"] });
    },
  }));
}
