import { db } from "./db";
import {
  products,
  settings,
  statusHistory,
  pageItems,
  type Product,
  type Settings,
  type StatusHistory,
  type PageItem,
  type InsertProduct,
  type InsertSettings,
  type InsertStatusHistory,
  type UpdateProductRequest,
  type UpdateSettingsRequest
} from "@shared/schema";
import { eq, desc, and, notInArray } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: UpdateProductRequest & { status?: string; lastRawStatus?: string | null; lastCheckedAt?: Date | null }): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  getSettings(): Promise<Settings | undefined>;
  updateSettings(updates: UpdateSettingsRequest): Promise<Settings>;

  createHistoryEntry(entry: InsertStatusHistory): Promise<StatusHistory>;
  getHistoryByProduct(productId: number): Promise<StatusHistory[]>;

  getPageItems(productId: number): Promise<PageItem[]>;
  upsertPageItem(productId: number, itemName: string, itemStatus: string): Promise<PageItem>;
  removeStalePageItems(productId: number, currentItemNames: string[]): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.id);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: UpdateProductRequest & { status?: string; lastRawStatus?: string | null; lastCheckedAt?: Date | null }): Promise<Product> {
    const [product] = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    if (!product) throw new Error("Product not found");
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(pageItems).where(eq(pageItems.productId, id));
    await db.delete(statusHistory).where(eq(statusHistory.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }

  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting;
  }

  async updateSettings(updates: UpdateSettingsRequest): Promise<Settings> {
    let [setting] = await db.select().from(settings).limit(1);
    if (setting) {
      const [updated] = await db.update(settings)
        .set(updates)
        .where(eq(settings.id, setting.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(updates).returning();
      return created;
    }
  }

  async createHistoryEntry(entry: InsertStatusHistory): Promise<StatusHistory> {
    const [record] = await db.insert(statusHistory).values(entry).returning();
    return record;
  }

  async getHistoryByProduct(productId: number): Promise<StatusHistory[]> {
    return await db.select().from(statusHistory)
      .where(eq(statusHistory.productId, productId))
      .orderBy(desc(statusHistory.detectedAt));
  }

  async getPageItems(productId: number): Promise<PageItem[]> {
    return await db.select().from(pageItems)
      .where(eq(pageItems.productId, productId))
      .orderBy(pageItems.itemName);
  }

  async upsertPageItem(productId: number, itemName: string, itemStatus: string): Promise<PageItem> {
    const now = new Date();
    const existing = await db.select().from(pageItems)
      .where(and(eq(pageItems.productId, productId), eq(pageItems.itemName, itemName)))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(pageItems)
        .set({ itemStatus, lastSeenAt: now })
        .where(eq(pageItems.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(pageItems)
        .values({ productId, itemName, itemStatus })
        .returning();
      return created;
    }
  }

  async removeStalePageItems(productId: number, currentItemNames: string[]): Promise<string[]> {
    if (currentItemNames.length === 0) {
      const removed = await db.select().from(pageItems).where(eq(pageItems.productId, productId));
      await db.delete(pageItems).where(eq(pageItems.productId, productId));
      return removed.map(r => r.itemName);
    }

    const stale = await db.select().from(pageItems)
      .where(and(
        eq(pageItems.productId, productId),
        notInArray(pageItems.itemName, currentItemNames)
      ));

    if (stale.length > 0) {
      await db.delete(pageItems).where(and(
        eq(pageItems.productId, productId),
        notInArray(pageItems.itemName, currentItemNames)
      ));
    }

    return stale.map(s => s.itemName);
  }
}

export const storage = new DatabaseStorage();
