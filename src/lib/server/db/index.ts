import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { env } from "$env/dynamic/private";

const sqlite = new Database(env.DB_PATH || "sqlite.db");
export const db = drizzle(sqlite, { schema });
