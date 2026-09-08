import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import fs from "fs";
import path from "path";

export async function POST({ request, cookies }) {
  if (cookies.get("admin_session") !== "active") {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return json(
        { success: false, error: "No file uploaded" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Eseguiamo direttamente la sostituzione.

    const dbPath = env.DB_PATH || "data/sqlite.db";
    const resolvedPath = path.resolve(dbPath);

    // Backup del vecchio DB (opzionale, ma sicuro) prima di sovrascrivere
    if (fs.existsSync(resolvedPath)) {
      fs.copyFileSync(resolvedPath, resolvedPath + ".bak");
    }

    // Sovrascrive il database fisico atomicamente
    fs.writeFileSync(resolvedPath + ".new", buffer);
    fs.renameSync(resolvedPath + ".new", resolvedPath);

    // Riavvia il container dopo 1 secondo per ricaricare le istanze globali di DB/Drizzle
    setTimeout(() => {
      console.log("Restarting container after DB restore...");
      process.exit(1);
    }, 1000);

    return json({ success: true });
  } catch (err: any) {
    console.error(err);
    return json({ success: false, error: err.message }, { status: 500 });
  }
}
