import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  label: text("label").notNull(),
  status: text("status").notNull().default("No Change"),
  lastRawStatus: text("last_raw_status"),
  lastCheckedAt: timestamp("last_checked_at"),
  isActive: boolean("is_active").notNull().default(true),
});

export const pageItems = pgTable("page_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  itemName: text("item_name").notNull(),
  itemStatus: text("item_status").notNull().default("Unknown"),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
});

export const statusHistory = pgTable("status_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  status: text("status").notNull(),
  changeDescription: text("change_description").notNull(),
  detectedAt: timestamp("detected_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  discordWebhookUrl: text("discord_webhook_url"),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  status: true,
  lastRawStatus: true,
  lastCheckedAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

export const insertStatusHistorySchema = createInsertSchema(statusHistory).omit({
  id: true,
  detectedAt: true,
});

export const insertPageItemSchema = createInsertSchema(pageItems).omit({
  id: true,
  lastSeenAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type StatusHistory = typeof statusHistory.$inferSelect;
export type InsertStatusHistory = z.infer<typeof insertStatusHistorySchema>;

export type PageItem = typeof pageItems.$inferSelect;
export type InsertPageItem = z.infer<typeof insertPageItemSchema>;

export type CreateProductRequest = InsertProduct;
export type UpdateProductRequest = Partial<InsertProduct>;
export type UpdateSettingsRequest = InsertSettings;
