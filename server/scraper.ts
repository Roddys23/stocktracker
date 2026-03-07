import * as cron from 'node-cron';
import * as cheerio from 'cheerio';
import { storage } from './storage';

interface ScrapedItem {
  name: string;
  status: string;
}

const MAX_PAGES = 50;

const PRODUCT_SELECTORS = [
  '.product-card',
  '.product-item',
  '.product',
  '[data-product]',
  '.grid-product',
  '.product-grid-item',
  '.collection-product',
  '.productgrid--item',
  '.grid__item',
  '.product-block',
  '.product-wrap',
  '.product-miniature',
  '.product-layout',
  '.card--product',
  '.product-tile',
];

const TITLE_SELECTORS = [
  '.product-title',
  '.product-name',
  '.product__title',
  '.product-card__title',
  '.product-item__title',
  'h2 a',
  'h3 a',
  'h4 a',
  '.card__heading a',
  '.card__title a',
  '.title a',
  '.name a',
  'a.product-link',
  '.product-link',
  '[data-product-title]',
  '.product__name',
];

function getItemStatus(el: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI): string {
  const text = el.text().toLowerCase();

  if (text.includes('sold out') || text.includes('out of stock') || text.includes('unavailable')) {
    return 'Out of Stock';
  }
  if (text.includes('add to cart') || text.includes('in stock') || text.includes('buy now') || text.includes('add to bag')) {
    return 'In Stock';
  }

  const badge = el.find('.badge, .tag, .label, .product-badge, .product-tag, [data-badge]');
  if (badge.length) {
    const badgeText = badge.text().toLowerCase();
    if (badgeText.includes('sold out') || badgeText.includes('out of stock')) return 'Out of Stock';
    if (badgeText.includes('new')) return 'New';
    if (badgeText.includes('in stock')) return 'In Stock';
  }

  const button = el.find('button, .btn, [type="submit"]');
  if (button.length) {
    const btnText = button.text().toLowerCase();
    if (btnText.includes('sold out') || btnText.includes('unavailable')) return 'Out of Stock';
    if (btnText.includes('add to cart') || btnText.includes('buy') || btnText.includes('add to bag')) return 'In Stock';
  }

  return 'Unknown';
}

function getItemName(el: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI): string | null {
  for (const sel of TITLE_SELECTORS) {
    const found = el.find(sel);
    if (found.length) {
      const text = found.first().text().trim();
      if (text.length > 0 && text.length < 300) return text;
    }
  }

  const headings = el.find('h1, h2, h3, h4, h5');
  if (headings.length) {
    const text = headings.first().text().trim();
    if (text.length > 0 && text.length < 300) return text;
  }

  const links = el.find('a');
  for (let i = 0; i < Math.min(links.length, 3); i++) {
    const text = $(links[i]).text().trim();
    if (text.length > 2 && text.length < 300 && !text.toLowerCase().includes('add to cart')) {
      return text;
    }
  }

  return null;
}

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

function findNextPageUrl($: cheerio.CheerioAPI, currentUrl: string): string | null {
  const nextLink = $('a[rel="next"]');
  if (nextLink.length) {
    const href = nextLink.attr('href');
    if (href) return resolveUrl(href, currentUrl);
  }

  const nextSelectors = [
    'a.next',
    '.pagination a.next',
    '.pagination-next a',
    'a[aria-label="Next"]',
    'a[aria-label="Next page"]',
    '.pagination__next',
    'link[rel="next"]',
  ];

  for (const sel of nextSelectors) {
    const el = $(sel);
    if (el.length) {
      const href = el.attr('href');
      if (href) return resolveUrl(href, currentUrl);
    }
  }

  const allLinks = $('a');
  for (let i = 0; i < allLinks.length; i++) {
    const el = $(allLinks[i]);
    const text = el.text().trim();
    if (text === 'Next' || text === '›' || text === '»' || text === 'Next →' || text === 'Next Page') {
      const href = el.attr('href');
      if (href) return resolveUrl(href, currentUrl);
    }
  }

  return null;
}

function resolveUrl(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

async function scrapeSinglePage(url: string): Promise<{ items: ScrapedItem[]; nextUrl: string | null }> {
  try {
    const response = await fetch(url, { headers: FETCH_HEADERS });

    if (!response.ok) {
      console.error(`Error fetching ${url}: Status ${response.status}`);
      return { items: [], nextUrl: null };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];
    const seenNames = new Set<string>();

    for (const selector of PRODUCT_SELECTORS) {
      const elements = $(selector);
      if (elements.length === 0) continue;

      elements.each((_i, el) => {
        const $el = $(el);
        const name = getItemName($el, $);
        if (!name || seenNames.has(name.toLowerCase())) return;

        seenNames.add(name.toLowerCase());
        const status = getItemStatus($el, $);
        items.push({ name, status });
      });

      if (items.length > 0) break;
    }

    if (items.length === 0) {
      const bodyText = $('body').text().toLowerCase();
      let pageStatus = 'Unknown';
      if (bodyText.includes('out of stock') || bodyText.includes('sold out') || bodyText.includes('unavailable')) {
        pageStatus = 'Out of Stock';
      } else if (bodyText.includes('add to cart') || bodyText.includes('in stock') || bodyText.includes('buy now')) {
        pageStatus = 'In Stock';
      } else if (bodyText.includes('new arrival') || bodyText.includes('new release')) {
        pageStatus = 'New';
      }

      const title = $('title').text().trim() || $('h1').first().text().trim() || 'Page';
      items.push({ name: title, status: pageStatus });
      return { items, nextUrl: null };
    }

    const nextUrl = findNextPageUrl($, url);
    return { items, nextUrl };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { items: [], nextUrl: null };
  }
}

export async function scrapePageItems(url: string): Promise<ScrapedItem[]> {
  const allItems: ScrapedItem[] = [];
  const seenNames = new Set<string>();
  let currentUrl: string | null = url;
  let pageCount = 0;

  while (currentUrl && pageCount < MAX_PAGES) {
    pageCount++;
    console.log(`Scraping page ${pageCount}: ${currentUrl}`);

    const { items, nextUrl } = await scrapeSinglePage(currentUrl);

    let newItemsOnThisPage = 0;
    for (const item of items) {
      const key = item.name.toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        allItems.push(item);
        newItemsOnThisPage++;
      }
    }

    if (newItemsOnThisPage === 0 && pageCount > 1) {
      console.log(`No new items found on page ${pageCount}, stopping pagination.`);
      break;
    }

    if (nextUrl && nextUrl !== currentUrl) {
      currentUrl = nextUrl;
    } else {
      try {
        const parsed = new URL(currentUrl);
        const currentPage = parseInt(parsed.searchParams.get('page') || '1', 10);
        if (pageCount === 1 && items.length > 1) {
          parsed.searchParams.set('page', String(currentPage + 1));
          currentUrl = parsed.href;
        } else {
          currentUrl = null;
        }
      } catch {
        currentUrl = null;
      }
    }
  }

  if (pageCount > 1) {
    console.log(`Pagination complete: scraped ${pageCount} pages, found ${allItems.length} total items.`);
  }

  return allItems;
}

export async function checkProductAndRecord(productId: number): Promise<{ status: string; changes: string[] }> {
  const product = await storage.getProduct(productId);
  if (!product) throw new Error("Product not found");

  const scrapedItems = await scrapePageItems(product.url);
  const now = new Date();
  const changes: string[] = [];

  if (scrapedItems.length === 0) {
    await storage.updateProduct(product.id, { lastCheckedAt: now });
    return { status: 'No Change', changes: [] };
  }

  const existingItems = await storage.getPageItems(product.id);
  const existingMap = new Map(existingItems.map(item => [item.itemName.toLowerCase(), item]));
  const isFirstScan = existingItems.length === 0;

  for (const scraped of scrapedItems) {
    const existingItem = existingMap.get(scraped.name.toLowerCase());

    if (!existingItem) {
      if (isFirstScan) {
        changes.push(`Initial scan: "${scraped.name}" is ${scraped.status}`);
      } else {
        changes.push(`New item found: "${scraped.name}" (${scraped.status})`);
      }
      await storage.createHistoryEntry({
        productId: product.id,
        status: scraped.status,
        changeDescription: isFirstScan
          ? `Initial scan: "${scraped.name}" is ${scraped.status}`
          : `New item found: "${scraped.name}" (${scraped.status})`,
      });
    } else if (existingItem.itemStatus !== scraped.status) {
      const desc = `"${scraped.name}" changed from ${existingItem.itemStatus} to ${scraped.status}`;
      changes.push(desc);
      await storage.createHistoryEntry({
        productId: product.id,
        status: scraped.status,
        changeDescription: desc,
      });
    }

    await storage.upsertPageItem(product.id, scraped.name, scraped.status);
  }

  const currentNames = scrapedItems.map(s => s.name);
  const removedNames = await storage.removeStalePageItems(product.id, currentNames);
  for (const removedName of removedNames) {
    const desc = `"${removedName}" is no longer listed on the page`;
    changes.push(desc);
    await storage.createHistoryEntry({
      productId: product.id,
      status: 'Removed',
      changeDescription: desc,
    });
  }

  const hasRealChanges = !isFirstScan && changes.length > 0;
  const statusSummary = scrapedItems.map(i => i.status).join(', ');

  await storage.updateProduct(product.id, {
    status: hasRealChanges ? 'Change' : 'No Change',
    lastRawStatus: statusSummary.substring(0, 255),
    lastCheckedAt: now,
  });

  return {
    status: hasRealChanges ? 'Change' : 'No Change',
    changes,
  };
}

export function startScraper() {
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running scheduled product check...');
    try {
      const products = await storage.getProducts();
      const settingsData = await storage.getSettings();

      for (const product of products) {
        if (!product.isActive) continue;

        const result = await checkProductAndRecord(product.id);

        if (result.status === 'Change' && result.changes.length > 0 && settingsData?.discordWebhookUrl) {
          const changeList = result.changes.slice(0, 10).map(c => `- ${c}`).join('\n');
          try {
            await fetch(settingsData.discordWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content: `**Stock Alert for ${product.label}!**\n${changeList}\n${product.url}`
              })
            });
          } catch (e) {
            console.error('Error sending discord webhook:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error in scheduled job:', err);
    }
  });
}
