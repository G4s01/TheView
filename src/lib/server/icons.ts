import fs from "fs";
import path from "path";
import { env } from "$env/dynamic/private";
import { db } from "$lib/server/db";
import { services } from "$lib/server/db/schema";

export async function cleanOrphanIcons() {
  try {
    const dbPath = env.DB_PATH || "data/sqlite.db";
    const dbDir = path.resolve(path.dirname(dbPath));
    const iconsDir = path.join(dbDir, "icons");

    if (!fs.existsSync(iconsDir)) {
      return;
    }

    const files = fs.readdirSync(iconsDir);
    if (files.length === 0) {
      return;
    }

    const allServices = await db.select({ icon: services.icon }).from(services);
    const usedIcons = new Set<string>();

    for (const service of allServices) {
      if (service.icon) {
        let filename: string | null = null;
        if (service.icon.startsWith("/api/icons/")) {
          filename = service.icon.substring("/api/icons/".length);
        } else if (service.icon.includes("/api/icons/")) {
          try {
            const urlObj = new URL(service.icon);
            if (urlObj.pathname.startsWith("/api/icons/")) {
              filename = urlObj.pathname.substring("/api/icons/".length);
            }
          } catch (e) {
            // Ignore invalid URLs
          }
        } else if (!service.icon.includes("/")) {
          // Fallback for icons saved just as a filename
          filename = service.icon;
        }

        if (filename) {
          const cleanFilename = filename.split("?")[0].split("#")[0];
          if (cleanFilename) usedIcons.add(cleanFilename);
        }
      }
    }

    let deletedCount = 0;
    const now = Date.now();
    const GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 minutes grace period for newly uploaded files

    for (const file of files) {
      if (!usedIcons.has(file)) {
        const filePath = path.join(iconsDir, file);
        try {
          const stat = fs.statSync(filePath);
          // Only delete files (skip directories) that are older than the grace period
          if (stat.isFile() && now - stat.mtimeMs > GRACE_PERIOD_MS) {
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`[cleanOrphanIcons] Elimino icona orfana: ${file}`);
          }
        } catch (err) {
          console.error(`[cleanOrphanIcons] Errore su file ${file}:`, err);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`[cleanOrphanIcons] Rimosse ${deletedCount} icone orfane.`);
    }
  } catch (error) {
    console.error("[cleanOrphanIcons] Errore durante la pulizia:", error);
  }
}
