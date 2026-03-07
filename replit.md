# StockWatch - Product Inventory Monitor

## Overview
A full-stack web application that monitors product URLs for inventory changes. The scraper parses individual items on each page with pagination support, so it can detect per-item stock changes (e.g., one item going from "Out of Stock" to "In Stock") and new items being added — even on collection/listing pages with many products across multiple pages.

## Tech Stack
- **Frontend**: React + TypeScript, Vite, TailwindCSS, Shadcn UI, Wouter routing, TanStack Query
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM (SSL enabled in production)
- **Scraping**: Cheerio (HTML parsing with per-item extraction + pagination)
- **Scheduler**: node-cron (every 15 minutes)
- **Notifications**: Discord Webhook

## Architecture
- `shared/schema.ts` — Drizzle table definitions and Zod schemas
- `shared/routes.ts` — API contract (paths, methods, input/output schemas)
- `server/db.ts` — Database connection pool (auto-enables SSL in production for Render)
- `server/storage.ts` — Database storage layer (IStorage interface + DatabaseStorage)
- `server/scraper.ts` — Per-item scraping logic + pagination + cron scheduler + history tracking
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
3. **Pagination**: follows "Next" links (`rel="next"`, text-based next buttons, or `?page=N` increment) up to 50 pages
4. Compares current items against previously stored `page_items` snapshot
5. Detects: individual item status changes, new items added, items removed
6. Records each change in `status_history` with a human-readable description
7. Falls back to whole-page text analysis if no structured product elements are found

## Status Logic
- The `status` field on products shows "Change" or "No Change" (whether any item changed since last scan)
- The `page_items` table stores the current snapshot of all items found on the page
- The `status_history` table records per-item changes (e.g., '"Blue Widget" changed from Out of Stock to In Stock')

## Running (Replit)
- `npm run dev` starts both the Express backend and Vite frontend on port 5000
- The scheduler runs every 15 minutes automatically
- Manual checks available via the "Check Now" button per product

## Render Deployment
- **Build Command**: `npm install --include=dev && npm run build`
- **Start Command**: `node dist/index.cjs`
- **Environment**: Node
- **Environment Variables**:
  - `DATABASE_URL` — PostgreSQL connection string (from Render's PostgreSQL add-on)
  - `PORT` — Automatically set by Render
- The app listens on `0.0.0.0` and uses `process.env.PORT` (already configured)
- SSL is automatically enabled for the database connection in production mode
- `cheerio` and `node-cron` are bundled into `dist/index.cjs` via esbuild
