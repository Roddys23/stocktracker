import { db } from "./db";
import {
  products,
  settings,
  type Product,
  type Settings,
  type InsertProduct,
  type InsertSettings,
  type UpdateProductRequest,
  type UpdateSettingsRequest
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: UpdateProductRequest): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  getSettings(): Promise<Settings | undefined>;
  updateSettings(updates: UpdateSettingsRequest): Promise<Settings>;
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

  async updateProduct(id: number, updates: UpdateProductRequest): Promise<Product> {
    const [product] = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    if (!product) throw new Error("Product not found");
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
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
}

export const storage = new DatabaseStorage();
