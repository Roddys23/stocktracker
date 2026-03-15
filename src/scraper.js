'use strict';

const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

chromium.use(StealthPlugin());

const ITEM_SELECTOR = '[data-product-id], .product-item, .product-card, article.product';
const NAME_SELECTOR = '.product-title, .product-name, h2, h3';
const OOS_SELECTOR  = '.sold-out, .out-of-stock, [data-availability="false"], .is-oos';
const NEXT_SELECTOR = 'a[rel="next"], a.next, .pagination__next';

async function scrapeAllPages(page, url) {
  const results = [];
  let currentUrl = url;
  const domain = new URL(url).hostname; // Get domain to make IDs unique

  while (currentUrl) {
    console.log(`[scraper] Visiting ${currentUrl}`);
    try {
      await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      // Short wait for dynamic content
      await page.waitForTimeout(2000); 
    } catch (err) {
      console.error(`[scraper] Failed to load ${currentUrl}:`, err.message);
      break; 
    }

    const items = await page.$$eval(
      ITEM_SELECTOR,
      (nodes, oosSelector, nameSelector, domainName) =>
        nodes.map((node) => {
          const nameEl = node.querySelector(nameSelector) || node;
          const name = (nameEl.textContent || '').trim().slice(0, 200);
          
          // Create a unique ID combining domain + original ID
          const rawId = node.dataset.productId || 
                        node.dataset.variantId || 
                        node.id || 
                        name.toLowerCase().replace(/\s+/g, '-');
          
          const itemId = `${domainName}-${rawId}`;
          const inStock = !node.querySelector(oosSelector) && !node.innerText.toLowerCase().includes('sold out');
          
          return { itemId, name, inStock };
        }),
      OOS_SELECTOR,
      NAME_SELECTOR,
      domain
    );

    results.push(...items);

    // Check for "Next" button
    const nextHref = await page.$eval(
      NEXT_SELECTOR,
      (el) => el.href || null
    ).catch(() => null);

    // Safety check: don't loop forever if nextHref is same as current
    currentUrl = (nextHref && nextHref !== currentUrl) ? nextHref : null;
  }

  return results;
}

async function scrape(url) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    const items = await scrapeAllPages(page, url);
    return items;
  } finally {
    await browser.close();
  }
}

module.exports = { scrape };