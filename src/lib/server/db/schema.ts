import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
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
  widgetType: text("widget_type"),
  pingEnabled: integer("ping_enabled", { mode: "boolean" })
    .default(true)
    .notNull(),
});
