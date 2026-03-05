# StockWatch - Product Inventory Monitor

## Overview
A full-stack web application that monitors product URLs for inventory changes. Users can add product URLs, and the app periodically scrapes them to detect status changes (In Stock, Out of Stock, New items). Status changes are tracked in a history log and can trigger Discord webhook notifications.

## Tech Stack
- **Frontend**: React + TypeScript, Vite, TailwindCSS, Shadcn UI, Wouter routing, TanStack Query
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Replit built-in) with Drizzle ORM
- **Scraping**: Cheerio (HTML parsing)
- **Scheduler**: node-cron (every 15 minutes)
- **Notifications**: Discord Webhook

## Architecture
- `shared/schema.ts` — Drizzle table definitions and Zod schemas
- `shared/routes.ts` — API contract (paths, methods, input/output schemas)
- `server/db.ts` — Database connection pool
- `server/storage.ts` — Database storage layer (IStorage interface + DatabaseStorage)
- `server/scraper.ts` — Scraping logic + cron scheduler + history tracking
- `server/routes.ts` — Express route handlers + seed data
- `client/src/pages/dashboard.tsx` — Main dashboard (responsive: cards on mobile, table on desktop)
- `client/src/pages/settings.tsx` — Discord webhook configuration
- `client/src/components/` — Reusable UI components (StatusBadge, AddProductDialog, Layout)
- `client/src/hooks/use-products.ts` — React Query hooks for products + history

## Key Database Tables
- `products` — Tracked URLs with label, status ("Change"/"No Change"), lastRawStatus (actual scraped value), isActive toggle
- `status_history` — Log of every detected change with human-readable descriptions
- `settings` — Discord webhook URL

## Status Logic
- The `status` field on products shows "Change" or "No Change" (whether something changed since last scan)
- The `lastRawStatus` field stores the actual scraped value ("In Stock", "Out of Stock", "New", "Unknown")
- The `status_history` table records every change with a description like "Item changed from Out of Stock to In Stock"

## Running
- `npm run dev` starts both the Express backend and Vite frontend on port 5000
- The scheduler runs every 15 minutes automatically
- Manual checks available via the "Check Now" button per product
