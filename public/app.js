const els = {
  tabButtons: Array.from(document.querySelectorAll('.tab-btn')),
  panels: {
    urls: document.getElementById('tab-urls'),
    settings: document.getElementById('tab-settings'),
  },
  urlForm: document.getElementById('url-form'),
  urlName: document.getElementById('url-name'),
  urlValue: document.getElementById('url-value'),
  urlList: document.getElementById('url-list'),
  urlFormFeedback: document.getElementById('url-form-feedback'),
  refreshUrls: document.getElementById('refresh-urls'),
  scrapeNow: document.getElementById('scrape-now'),
  scrapeFeedback: document.getElementById('scrape-feedback'),
  webhookForm: document.getElementById('webhook-form'),
  webhookUrl: document.getElementById('webhook-url'),
  webhookFeedback: document.getElementById('webhook-feedback'),
  urlTemplate: document.getElementById('url-card-template'),
};

function showFeedback(node, text, type = '') {
  node.textContent = text;
  node.classList.remove('error', 'success');
  if (type) node.classList.add(type);
}

function formatTime(value) {
  if (!value) return 'Not checked yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not checked yet';
  return `Last check: ${date.toLocaleString()}`;
}

function setActiveTab(tabName) {
  els.tabButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.tab === tabName);
  });

  Object.entries(els.panels).forEach(([name, panel]) => {
    panel.classList.toggle('is-active', name === tabName);
  });
}

async function loadUrls() {
  showFeedback(els.urlFormFeedback, 'Loading tracked URLs...');

  try {
    const res = await fetch('/api/urls');
    if (!res.ok) throw new Error('Could not load URLs');
    const urls = await res.json();
    renderUrls(urls);
    showFeedback(els.urlFormFeedback, `Loaded ${urls.length} URL(s).`, 'success');
  } catch (err) {
    showFeedback(els.urlFormFeedback, 'Failed to load tracked URLs.', 'error');
  }
}

function renderUrls(urls) {
  els.urlList.innerHTML = '';

  if (!urls.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No URLs tracked yet. Add one above to get started.';
    els.urlList.appendChild(empty);
    return;
  }

  urls.forEach((entry) => {
    const node = els.urlTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('.url-name').textContent = entry.name || entry.url;
    node.querySelector('.url-value').textContent = entry.url;

    const chip = node.querySelector('.status-chip');
    const changed = Boolean(entry.changedSinceLastCheck);
    chip.textContent = changed ? 'Changed' : 'No Change';
    chip.classList.add(changed ? 'changed' : 'no-change');

    node.querySelector('.last-check').textContent = formatTime(entry.lastCheck);

    const deleteBtn = node.querySelector('.delete-url');
    deleteBtn.addEventListener('click', async () => {
      const confirmed = window.confirm('Delete this URL and all tracked item history for it?');
      if (!confirmed) return;

      try {
        const res = await fetch(`/api/urls/${entry.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        await loadUrls();
      } catch (err) {
        showFeedback(els.urlFormFeedback, 'Delete failed. Try again.', 'error');
      }
    });

    els.urlList.appendChild(node);
  });
}

async function createUrl(event) {
  event.preventDefault();

  const payload = {
    name: els.urlName.value.trim(),
    url: els.urlValue.value.trim(),
  };

  showFeedback(els.urlFormFeedback, 'Saving URL...');

  try {
    const res = await fetch('/api/urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Could not add URL');
    }

    els.urlForm.reset();
    showFeedback(els.urlFormFeedback, 'URL added successfully.', 'success');
    await loadUrls();
  } catch (err) {
    showFeedback(els.urlFormFeedback, err.message || 'Failed to add URL.', 'error');
  }
}

async function triggerScrapeNow() {
  showFeedback(els.scrapeFeedback, 'Scrape started\u2026');
  els.scrapeNow.disabled = true;

  try {
    const res = await fetch('/api/scrape-now', { method: 'POST' });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || 'Could not start scrape');
    }

    showFeedback(els.scrapeFeedback, 'Scrape is running. The list will refresh automatically.', 'success');
    // Refresh list after a short delay to pick up any fast results
    setTimeout(loadUrls, 4000);
  } catch (err) {
    showFeedback(els.scrapeFeedback, err.message || 'Failed to start scrape.', 'error');
  } finally {
    els.scrapeNow.disabled = false;
  }
}

async function loadWebhookSetting() {
  showFeedback(els.webhookFeedback, 'Loading settings...');

  try {
    const res = await fetch('/api/settings/webhook');
    if (!res.ok) throw new Error('Could not load setting');

    const data = await res.json();
    els.webhookUrl.value = data.webhookUrl || '';
    showFeedback(els.webhookFeedback, 'Settings loaded.', 'success');
  } catch (err) {
    showFeedback(els.webhookFeedback, 'Failed to load settings.', 'error');
  }
}

async function saveWebhookSetting(event) {
  event.preventDefault();

  showFeedback(els.webhookFeedback, 'Saving settings...');

  try {
    const res = await fetch('/api/settings/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl: els.webhookUrl.value.trim() }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Could not save setting');

    showFeedback(els.webhookFeedback, 'Webhook saved.', 'success');
  } catch (err) {
    showFeedback(els.webhookFeedback, err.message || 'Failed to save webhook.', 'error');
  }
}

function initTabs() {
  els.tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
  });
}

function init() {
  initTabs();
  els.urlForm.addEventListener('submit', createUrl);
  els.refreshUrls.addEventListener('click', loadUrls);
  els.scrapeNow.addEventListener('click', triggerScrapeNow);
  els.webhookForm.addEventListener('submit', saveWebhookSetting);

  loadUrls();
  loadWebhookSetting();
  setInterval(loadUrls, 30000);
}

init();
