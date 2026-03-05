import * as cron from 'node-cron';
import * as cheerio from 'cheerio';
import { storage } from './storage';

export async function scrapeRawStatus(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Error fetching ${url}: Status ${response.status}`);
      return 'Unknown';
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const bodyText = $('body').text().toLowerCase();

    if (bodyText.includes('out of stock') || bodyText.includes('sold out') || bodyText.includes('unavailable')) {
      return 'Out of Stock';
    } else if (bodyText.includes('add to cart') || bodyText.includes('in stock') || bodyText.includes('buy now')) {
      return 'In Stock';
    } else if (bodyText.includes('new arrival') || bodyText.includes('new release')) {
      return 'New';
    }

    return 'Unknown';
  } catch (error) {
    console.error(`Error checking product ${url}:`, error);
    return 'Unknown';
  }
}

function buildChangeDescription(oldRaw: string | null, newRaw: string): string {
  if (!oldRaw) {
    return `Initial scan: status is "${newRaw}"`;
  }
  if (newRaw === 'New') {
    return `New item detected on the page`;
  }
  return `Item changed from "${oldRaw}" to "${newRaw}"`;
}

export async function checkProductAndRecord(productId: number): Promise<{ status: string; rawStatus: string }> {
  const product = await storage.getProduct(productId);
  if (!product) throw new Error("Product not found");

  const newRawStatus = await scrapeRawStatus(product.url);
  const now = new Date();
  const oldRaw = product.lastRawStatus;
  const hasChanged = oldRaw !== null && newRawStatus !== oldRaw;

  if (hasChanged) {
    const description = buildChangeDescription(oldRaw, newRawStatus);
    await storage.createHistoryEntry({
      productId: product.id,
      status: newRawStatus,
      changeDescription: description,
    });
    await storage.updateProduct(product.id, {
      status: 'Change',
      lastRawStatus: newRawStatus,
      lastCheckedAt: now,
    });
  } else if (oldRaw === null) {
    await storage.createHistoryEntry({
      productId: product.id,
      status: newRawStatus,
      changeDescription: buildChangeDescription(null, newRawStatus),
    });
    await storage.updateProduct(product.id, {
      status: 'No Change',
      lastRawStatus: newRawStatus,
      lastCheckedAt: now,
    });
  } else {
    await storage.updateProduct(product.id, {
      status: 'No Change',
      lastCheckedAt: now,
    });
  }

  return {
    status: hasChanged ? 'Change' : 'No Change',
    rawStatus: newRawStatus,
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

        const oldRaw = product.lastRawStatus;
        const result = await checkProductAndRecord(product.id);

        if (result.status === 'Change' && settingsData?.discordWebhookUrl) {
          const description = buildChangeDescription(oldRaw, result.rawStatus);
          try {
            await fetch(settingsData.discordWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content: `**Stock Alert!**\n**${product.label}**: ${description}\n${product.url}`
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
