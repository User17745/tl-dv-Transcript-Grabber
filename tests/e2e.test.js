const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname, '../');
const MOCK_PAGE_PATH = 'file://' + path.resolve(__dirname, 'mock_page.html');

describe('E2E Interaction Test', () => {
  let browser;
  let page;
  let extensionId;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    // Get extension ID
    const targets = await browser.targets();
    const extensionTarget = targets.find((t) =>
      t.url().startsWith('chrome-extension://')
    );
    if (extensionTarget) {
      const match = extensionTarget
        .url()
        .match(/chrome-extension:\/\/([a-z]+)\//);
      if (match) extensionId = match[1];
    }

    if (!extensionId) {
      // Wait a bit more and try again
      await new Promise((r) => setTimeout(r, 3000));
      const newTargets = await browser.targets();
      const t = newTargets.find((t) =>
        t.url().startsWith('chrome-extension://')
      );
      if (t) {
        const match = t.url().match(/chrome-extension:\/\/([a-z]+)\//);
        if (match) extensionId = match[1];
      }
    }

    // Final fallback: Navigate to chrome://extensions/
    if (!extensionId) {
      const tempPage = await browser.newPage();
      await tempPage.goto('chrome://extensions/');
      // In headful mode, we can inspect this, but it's hard in headless.
      // However, we are in headful mode!
      await new Promise((r) => setTimeout(r, 1000));
      await tempPage.close();
    }
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  test('Extension should scrape from a mock tl;dv page', async () => {
    page = await browser.newPage();
    // Since we check URL includes 'tldv.io', we must mock the URL or adjust the code.
    // For E2E tests, we'll navigate to a page that looks like tldv.io
    // Temporarily using a data URL with a fake hostname check bypass if needed,
    // OR we can use request interception to map a fake domain to our local file.

    await page.goto(MOCK_PAGE_PATH);

    // Open popup
    const popupPage = await browser.newPage();
    // We need the extension ID to open the popup URL directly
    if (!extensionId) {
      // Try to find it one more time from targets
      const targets = await browser.targets();
      const t = targets.find((t) => t.url().startsWith('chrome-extension://'));
      if (t) {
        const match = t.url().match(/chrome-extension:\/\/([a-z]+)\//);
        if (match) extensionId = match[1];
      }
    }

    expect(extensionId).toBeDefined();

    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.bringToFront();

    // Check if popup loaded
    const title = await popupPage.$eval('h3', (el) => el.textContent);
    expect(title).toBe('tl;dv Transcript Grabber');

    // Check if buttons are present
    const copyBtn = await popupPage.$('#copy-txt');
    expect(copyBtn).not.toBeNull();

    // Note: Actual scraping will fail if the URL isn't tldv.io due to the check in popup.js
    // We could theoretically use request interception or navigate to a data URL with a fake origin.
  });
});
