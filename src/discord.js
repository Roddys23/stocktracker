'use strict';

const axios = require('axios');
const { getSetting } = require('./db');

const ENV_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function resolveWebhookUrl() {
  const stored = await getSetting('discord_webhook_url').catch(() => null);
  return (stored && stored.trim()) || ENV_WEBHOOK_URL || '';
}

/**
 * Send a Discord embed notification.
 * @param {'new'|'restock'} type
 * @param {string} itemName
 * @param {string} pageUrl
 */
async function notify(type, itemName, pageUrl) {
  const webhookUrl = await resolveWebhookUrl();

  if (!webhookUrl) {
    console.warn('[discord] No webhook URL configured - skipping notification.');
    return;
  }

  const isNew = type === 'new';
  const embed = {
    title: isNew ? 'New Item Detected' : 'Item Back In Stock',
    description: `**${itemName}**`,
    url: pageUrl,
    color: isNew ? 0x3498db : 0x2ecc71,
    fields: [
      { name: 'Status', value: isNew ? 'New listing found' : 'Now available', inline: true },
      { name: 'Page', value: pageUrl, inline: false },
    ],
    footer: { text: `StockTracker - ${new Date().toUTCString()}` },
  };

  try {
    await axios.post(webhookUrl, { embeds: [embed] });
    console.log(`[discord] Sent "${type}" alert for "${itemName}"`);
  } catch (err) {
    console.error('[discord] Failed to send notification:', err.message);
  }
}

module.exports = { notify };
