import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const dashboard_grids = sqliteTable("dashboard_grids", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  show_header: integer("show_header", { mode: "boolean" })
    .default(true)
    .notNull(),
  position: integer("position").default(0),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  icon: text("icon"),
  position: integer("position").default(0),
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  grid_id: integer("grid_id").references(() => dashboard_grids.id),
  categoryId: integer("category_id").references(() => categories.id),
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
  size: text("size").default("1x1").notNull(),
  isWidget: integer("is_widget", { mode: "boolean" }).default(false).notNull(),
  requireAuth: integer("require_auth", { mode: "boolean" })
    .default(false)
    .notNull(),
  widgetSize: text("widget_size").default("1x1").notNull(),
  x: integer("x").default(0).notNull(),
  y: integer("y").default(0).notNull(),
  w: integer("w").default(2).notNull(),
  h: integer("h").default(2).notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});
