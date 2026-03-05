import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  label: text("label").notNull(),
  status: text("status").notNull().default("Unknown"), // "In Stock", "Out of Stock", "Unknown"
  lastCheckedAt: timestamp("last_checked_at"),
  isActive: boolean("is_active").notNull().default(true),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  discordWebhookUrl: text("discord_webhook_url"),
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  status: true, 
  lastCheckedAt: true 
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// API CONTRACT
export type CreateProductRequest = InsertProduct;
export type UpdateProductRequest = Partial<InsertProduct>;
export type UpdateSettingsRequest = InsertSettings;
