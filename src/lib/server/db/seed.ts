import { db } from "./index";
import { categories, services } from "./schema";

async function seed() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (optional but good for a fresh start during dev)
  await db.delete(services);
  await db.delete(categories);

  // Insert Categories
  console.log("Inserting categories...");
  const cats = await db
    .insert(categories)
    .values([
      { name: "Network & System" },
      { name: "Apps & Media" },
      { name: "Utilities" },
    ])
    .returning();

  const catMap = {
    network: cats.find((c) => c.name === "Network & System")!.id,
    apps: cats.find((c) => c.name === "Apps & Media")!.id,
    utils: cats.find((c) => c.name === "Utilities")!.id,
  };

  // Insert Services
  console.log("Inserting services...");
  await db.insert(services).values([
    // Network & System
    {
      categoryId: catMap.network,
      name: "AdGuard Home",
      description: "DNS Sinkhole",
      url: "https://adguard.g4ss.duckdns.org",
      icon: "adguard",
      pingEnabled: true,
    },
    {
      categoryId: catMap.network,
      name: "Nginx Proxy Manager",
      description: "Reverse Proxy",
      url: "https://npm.g4ss.duckdns.org",
      icon: "nginxproxymanager",
      pingEnabled: true,
    },
    {
      categoryId: catMap.network,
      name: "Beszel",
      description: "System Stats",
      url: "https://sys.g4ss.duckdns.org",
      icon: "server",
      pingEnabled: true,
    },
    {
      categoryId: catMap.network,
      name: "WireGuard",
      description: "VPN",
      url: "https://vpn.g4ss.duckdns.org",
      icon: "wireguard",
      pingEnabled: true,
    },
    {
      categoryId: catMap.network,
      name: "LuCI (OpenWrt)",
      description: "Router OS",
      url: "https://wrt.g4ss.duckdns.org",
      icon: "openwrt",
      pingEnabled: true,
    },
    {
      categoryId: catMap.network,
      name: "Dockhand",
      description: "Docker Management",
      url: "https://dock.g4ss.duckdns.org",
      icon: "docker",
      widgetType: "dockhand",
      pingEnabled: true,
    },

    // Apps & Media
    {
      categoryId: catMap.apps,
      name: "Jellyfin",
      description: "Media Server",
      url: "https://tv.g4ss.duckdns.org",
      icon: "jellyfin",
      pingEnabled: true,
    },
    {
      categoryId: catMap.apps,
      name: "qBittorrent",
      description: "Torrent Client",
      url: "https://qbit.g4ss.duckdns.org",
      icon: "qbittorrent",
      widgetType: "qbittorrent",
      pingEnabled: true,
    },
    {
      categoryId: catMap.apps,
      name: "Files",
      description: "Filebrowser Quantum",
      url: "https://fm.g4ss.duckdns.org",
      icon: "folder",
      pingEnabled: true,
    },

    // Utilities
    {
      categoryId: catMap.utils,
      name: "Duplicati",
      description: "Backup Server",
      url: "https://backup.g4ss.duckdns.org",
      icon: "duplicati",
      pingEnabled: true,
    },
    {
      categoryId: catMap.utils,
      name: "Releases",
      description: "Nginx Repo",
      url: "https://releases.g4ss.duckdns.org",
      icon: "nginx",
      pingEnabled: true,
    },
    {
      categoryId: catMap.utils,
      name: "Very Mobile",
      description: "Area Clienti",
      url: "https://very.g4ss.duckdns.org",
      icon: "smartphone",
      pingEnabled: true,
    },
  ]);

  console.log("✅ Seeding completed successfully!");
}

seed().catch((e) => {
  console.error("❌ Seeding failed:");
  console.error(e);
  process.exit(1);
});
