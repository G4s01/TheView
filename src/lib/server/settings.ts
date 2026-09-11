import { db } from "./db/index";
import { settings as settingsTable } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getSettings(): Promise<Record<string, any>> {
  try {
    const rows = await db.select().from(settingsTable);
    const settingsObj: Record<string, any> = {};
    for (const row of rows) {
      try {
        // If it looks like a boolean or number, parse it
        if (row.value === "true") settingsObj[row.key] = true;
        else if (row.value === "false") settingsObj[row.key] = false;
        else if (!isNaN(Number(row.value)) && row.value.trim() !== "")
          settingsObj[row.key] = Number(row.value);
        else settingsObj[row.key] = row.value;
      } catch {
        settingsObj[row.key] = row.value;
      }
    }
    return settingsObj;
  } catch (e) {
    console.error("Failed to read settings from DB", e);
    return {};
  }
}

export async function saveSettings(newSettings: Record<string, any>) {
  try {
    const current = await getSettings();
    const merged = { ...current, ...newSettings };

    for (const [key, val] of Object.entries(merged)) {
      if (val === undefined) continue;

      if (val === null) {
        await db.delete(settingsTable).where(eq(settingsTable.key, key));
        continue;
      }

      const strVal = typeof val === "string" ? val : String(val);
      await db
        .insert(settingsTable)
        .values({ key, value: strVal })
        .onConflictDoUpdate({
          target: settingsTable.key,
          set: { value: strVal },
        });
    }
    return merged;
  } catch (e) {
    console.error("Failed to save settings to DB", e);
    return {};
  }
}
