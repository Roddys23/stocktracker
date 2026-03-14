'use strict';

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Apply stealth plugin to avoid bot-detection on Render IPs
chromium.use(StealthPlugin());

/**
 * Selectors used to find product cards on a page.
 * Adjust these to match the shop you are tracking.
 */
const ITEM_SELECTOR = '[data-product-id], .product-item, .product-card, article.product';
const NAME_SELECTOR = '.product-title, .product-name, h2, h3';
const OOS_SELECTOR  = '.sold-out, .out-of-stock, [data-availability="false"]';
const NEXT_SELECTOR = 'a[rel="next"], a.next, .pagination__next, button.next-page';

/**
 * Scrape all items from a URL, following pagination.
 * Returns a flat array of { itemId, name, inStock } objects.
 *
 * @param {import('playwright').Page} page  – an already-open Playwright page
 * @param {string} url                      – starting URL
 * @returns {Promise<Array<{itemId: string, name: string, inStock: boolean}>>}
 */
async function scrapeAllPages(page, url) {
  const results = [];
  let currentUrl = url;

  while (currentUrl) {
    console.log(`[scraper] Visiting ${currentUrl}`);
    await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    // Wait for the network to be idle so JS-rendered content is present
    await page.waitForLoadState('networkidle').catch(() => {
      // networkidle may time-out on some pages; fall back gracefully
    });

    const items = await page.$$eval(
      ITEM_SELECTOR,
      (nodes, oosSelector, nameSelector) =>
        nodes.map((node) => {
          const nameEl = node.querySelector(nameSelector) || node;
          const name    = (nameEl.textContent || '').trim().slice(0, 200);
          const itemId  =
            node.dataset.productId ||
            node.dataset.variantId ||
            node.id ||
            (node.querySelector('a') || {}).href ||
            name.toLowerCase().replace(/\s+/g, '-');
          const inStock = !node.querySelector(oosSelector);
          return { itemId, name, inStock };
        }),
      OOS_SELECTOR,
      NAME_SELECTOR,
    );

    results.push(...items);

    // Check for a "Next" pagination link
    const nextHref = await page.$eval(
      NEXT_SELECTOR,
      (el) => el.href || el.getAttribute('data-url') || null,
    ).catch(() => null);

    currentUrl = nextHref || null;
  }

  return results;
}

/**
 * Launch a browser, scrape the given URL (with all pages), then close the browser.
 * @param {string} url
 * @returns {Promise<Array<{itemId: string, name: string, inStock: boolean}>>}
 */
async function scrape(url) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const context = await browser.newContext({
    userAgent:
      process.env.SCRAPER_USER_AGENT ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-GB',
  });

  const page = await context.newPage();

  try {
    const items = await scrapeAllPages(page, url);
    console.log(`[scraper] Found ${items.length} item(s) across all pages for ${url}`);
    return items;
  } finally {
    await browser.close();
  }
}

module.exports = { scrape };
