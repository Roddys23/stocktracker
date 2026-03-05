import { z } from "zod";
import { insertProductSchema, products, settings, statusHistory, insertSettingsSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  products: {
    list: {
      method: "GET" as const,
      path: "/api/products" as const,
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/products" as const,
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/products/:id" as const,
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/products/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    checkNow: {
      method: "POST" as const,
      path: "/api/products/:id/check" as const,
      responses: {
        200: z.object({ success: z.boolean(), status: z.string(), rawStatus: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  history: {
    list: {
      method: "GET" as const,
      path: "/api/products/:id/history" as const,
      responses: {
        200: z.array(z.custom<typeof statusHistory.$inferSelect>()),
      },
    },
  },
  settings: {
    get: {
      method: "GET" as const,
      path: "/api/settings" as const,
      responses: {
        200: z.custom<typeof settings.$inferSelect>().nullable(),
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/settings" as const,
      input: insertSettingsSchema,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ProductResponse = z.infer<typeof api.products.list.responses[200]>[0];
export type SettingsResponse = z.infer<typeof api.settings.get.responses[200]>;
export type ProductInput = z.infer<typeof api.products.create.input>;
export type SettingsInput = z.infer<typeof api.settings.update.input>;
export type StatusHistoryResponse = z.infer<typeof api.history.list.responses[200]>[0];
