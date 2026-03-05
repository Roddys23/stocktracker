import * as cron from 'node-cron';
import * as cheerio from 'cheerio';
import { storage } from './storage';

export async function checkProduct(url: string): Promise<string> {
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

    // Simple heuristic for demo purposes:
    if (bodyText.includes('out of stock') || bodyText.includes('sold out') || bodyText.includes('unavailable')) {
      return 'Out of Stock';
    } else if (bodyText.includes('add to cart') || bodyText.includes('in stock') || bodyText.includes('buy now')) {
      return 'In Stock';
    } else if (bodyText.includes('new arrival') || bodyText.includes('new release')) {
      return 'New';
    }
    
    // If we can't definitively tell it's out of stock or in stock, we return Unknown
    return 'Unknown';
  } catch (error) {
    console.error(`Error checking product ${url}:`, error);
    return 'Unknown';
  }
}

export function startScraper() {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running scheduled product check...');
    try {
      const products = await storage.getProducts();
      const settings = await storage.getSettings();
      
      for (const product of products) {
        if (!product.isActive) continue;
        
        const newStatus = await checkProduct(product.url);
        const now = new Date();
        
        if (newStatus !== product.status) {
          console.log(`Product ${product.label} status changed from ${product.status} to ${newStatus}`);
          
          await storage.updateProduct(product.id, { status: newStatus, lastCheckedAt: now });
          
          // Notify if it's a positive change
          if ((newStatus === 'In Stock' || newStatus === 'New') && settings?.discordWebhookUrl) {
            try {
              await fetch(settings.discordWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: `🚨 **Stock Alert!**\n**${product.label}** is now **${newStatus}**!\n${product.url}`
                })
              });
            } catch (e) {
              console.error('Error sending discord webhook:', e);
            }
          }
        } else {
          await storage.updateProduct(product.id, { lastCheckedAt: now });
        }
      }
    } catch (err) {
      console.error('Error in scheduled job:', err);
    }
  });
}
