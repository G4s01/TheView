import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  position: integer("position").default(0),
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  icon: text("icon"),
  dockerImage: text("docker_image"),
  widgetType: text("widget_type"),
  pingEnabled: integer("ping_enabled", { mode: "boolean" })
    .default(true)
    .notNull(),
  position: integer("position").default(0),
  size: text("size", { enum: ["1x1", "2x1", "2x2", "1x2"] })
    .default("1x1")
    .notNull(),
  isWidget: integer("is_widget", { mode: "boolean" }).default(false).notNull(),
  requireAuth: integer("require_auth", { mode: "boolean" })
    .default(false)
    .notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
