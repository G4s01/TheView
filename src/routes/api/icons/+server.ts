import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.isAdmin) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || !file.name) {
      return json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save to the same directory as the database
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    const dbPath = env.DB_PATH || "data/sqlite.db";
    const dbDir = path.resolve(path.dirname(dbPath));
    const uploadDir = path.join(dbDir, "icons");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    return json({ url: `/api/icons/${filename}` });
  } catch (error) {
    console.error("Failed to upload icon:", error);
    return json({ error: "Failed to upload icon" }, { status: 500 });
  }
};
