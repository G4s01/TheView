import type { RequestHandler } from "./$types";
import fs from "fs";
import path from "path";
import { env } from "$env/dynamic/private";

export const GET: RequestHandler = async ({ params }) => {
  const filename = params.filename;
  if (!filename) {
    return new Response("Not found", { status: 404 });
  }

  const safeFilename = path.basename(filename);
  const dbPath = env.DB_PATH || "data/sqlite.db";
  const dbDir = path.resolve(path.dirname(dbPath));
  const filePath = path.join(dbDir, "icons", safeFilename);

  if (!fs.existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const stat = fs.statSync(filePath);
    const file = fs.readFileSync(filePath);

    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";

    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving icon:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
