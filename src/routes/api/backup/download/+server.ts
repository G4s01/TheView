import { env } from "$env/dynamic/private";
import fs from "fs";
import path from "path";

export async function GET({ cookies }) {
  if (cookies.get("admin_session") !== "active") {
    return new Response("Unauthorized", { status: 401 });
  }

  const dbPath = env.DB_PATH || "data/sqlite.db";
  const resolvedPath = path.resolve(dbPath);

  if (!fs.existsSync(resolvedPath)) {
    return new Response("Database not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(resolvedPath);

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": "application/vnd.sqlite3",
      "Content-Disposition": `attachment; filename="theview_backup_${new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19)}.db"`,
    },
  });
}
