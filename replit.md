# StockWatch - Product Inventory Monitor

## Overview
A full-stack web application that monitors product URLs for inventory changes. The scraper parses individual items on each page, so it can detect per-item stock changes (e.g., one item going from "Out of Stock" to "In Stock") and new items being added — even on collection/listing pages with many products.

## Tech Stack
- **Frontend**: React + TypeScript, Vite, TailwindCSS, Shadcn UI, Wouter routing, TanStack Query
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Replit built-in) with Drizzle ORM
- **Scraping**: Cheerio (HTML parsing with per-item extraction)
- **Scheduler**: node-cron (every 15 minutes)
- **Notifications**: Discord Webhook

## Architecture
- `shared/schema.ts` — Drizzle table definitions and Zod schemas
- `shared/routes.ts` — API contract (paths, methods, input/output schemas)
- `server/db.ts` — Database connection pool
- `server/storage.ts` — Database storage layer (IStorage interface + DatabaseStorage)
- `server/scraper.ts` — Per-item scraping logic + cron scheduler + history tracking
- `server/routes.ts` — Express route handlers + seed data
- `client/src/pages/dashboard.tsx` — Main dashboard (responsive: cards on mobile, table on desktop)
- `client/src/pages/settings.tsx` — Discord webhook configuration
- `client/src/components/` — Reusable UI components (StatusBadge, AddProductDialog, Layout)
- `client/src/hooks/use-products.ts` — React Query hooks for products, history, and page items

## Key Database Tables
- `products` — Tracked URLs with label, status ("Change"/"No Change"), lastRawStatus, isActive toggle
- `page_items` — Individual items found on each monitored page (name, status per item)
- `status_history` — Log of every detected change with per-item descriptions
- `settings` — Discord webhook URL

## Scraper Logic
1. Fetches the page HTML and uses Cheerio to find product elements using common CSS selectors
2. For each product element, extracts the item name and determines its stock status
3. Compares current items against previously stored `page_items` snapshot
4. Detects: individual item status changes, new items added, items removed
5. Records each change in `status_history` with a human-readable description
6. Falls back to whole-page text analysis if no structured product elements are found

## Status Logic
- The `status` field on products shows "Change" or "No Change" (whether any item changed since last scan)
- The `page_items` table stores the current snapshot of all items found on the page
- The `status_history` table records per-item changes (e.g., '"Blue Widget" changed from Out of Stock to In Stock')

## Running
- `npm run dev` starts both the Express backend and Vite frontend on port 5000
- The scheduler runs every 15 minutes automatically
- Manual checks available via the "Check Now" button per product
