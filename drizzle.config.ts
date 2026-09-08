import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/server/db/schema.ts",
  out: "./src/lib/server/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "data/sqlite.db",
  },
});
