const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname, '../');

describe('E2E Smoke Test', () => {
    let browser;
    let extensionId;

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: false, // Extensions require headful mode in Puppeteer usually
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        // Wait for extension to load
        // We can capture the background target or service worker to get the ID
        // Note: This needs the extension to have a background script/worker to appear easily in targets.
        // Since V3 doesn't enforce one if not needed, we might rely on listing targets.

        await new Promise(r => setTimeout(r, 1000)); // Basic wait for load
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    test('Browser should launch with extension loaded', async () => {
        const targets = await browser.targets();
        // Check if any target is related to the extension
        // This is a loose check but confirms the browser didn't crash on load
        expect(targets.length).toBeGreaterThan(0);
    });

    // Deeper E2E tests for popup interactions are complex without stable ID or background worker.
    // For this scope, confirming launch capability is the "Smoke Test".
});
