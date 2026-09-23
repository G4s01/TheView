import { createQuery } from "@tanstack/svelte-query";

export interface OpenwrtInterface {
  name: string;
  device: string;
  up: boolean;
  uptime: number;
  ipv4: string[];
  ipv6: string[];
  rx_bytes: number;
  tx_bytes: number;
}

export interface OpenwrtData {
  system: {
    uptime: number;
    load: number[];
    memory: {
      total: number;
      free: number;
      shared: number;
      buffered: number;
    };
  };
  interfaces: OpenwrtInterface[];
  devices: {
    name: string;
    up: boolean;
    macaddr?: string;
    speed?: string | number;
    type?: string;
  }[];
}

export function useOpenwrt(enabled = true) {
  return createQuery(() => ({
    queryKey: ["openwrt"],
    queryFn: async (): Promise<OpenwrtData> => {
      const response = await fetch("/api/widgets/openwrt");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Errore HTTP ${response.status}`);
      }
      return response.json();
    },
    enabled,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  }));
}
