import { chromium } from 'playwright';

const url = process.env.APP_URL ?? 'http://localhost:5174/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1680, height: 980 } });
  const page = await ctx.newPage();

  // Inject monkey-patch BEFORE app loads to capture stack on undefined width.
  await page.addInitScript(() => {
    const orig = window.SVGRectElement.prototype.setAttribute;
    window.SVGRectElement.prototype.setAttribute = function (name, value) {
      if (name === 'width' && (value === undefined || value === 'undefined' || Number.isNaN(value))) {
        // eslint-disable-next-line no-console
        console.warn('[RECT-UNDEFINED] caller stack:', new Error().stack);
      }
      return orig.call(this, name, value);
    };
  });

  const warns = [];
  page.on('console', (m) => {
    if (m.text().includes('[RECT-UNDEFINED]')) warns.push(m.text());
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('a[href="/editor"]').first().click();
  await page.waitForSelector('.rack-config');
  await page.locator('.rack-options .button', { hasText: '12U' }).click();
  await page.waitForTimeout(800);

  // Add a few devices then flip to back
  const search = page.locator('.search-field input');
  for (const [q, name] of [
    ['Wave 1073', 'Wave 1073-A'],
    ['Custom XLR', 'Custom XLR Bay'],
    ['Studio Fanout', 'Studio Fanout'],
    ['Crown', 'Crown DCi'],
  ]) {
    await search.fill(q);
    await page.waitForTimeout(120);
    await page.locator('.device-card', { hasText: name }).first().click();
    await page.waitForTimeout(150);
    await search.fill('');
  }
  await page.waitForTimeout(400);

  await page.locator('.view-toggle button', { hasText: 'back' }).click();
  await page.waitForTimeout(700);
  await page.locator('.view-toggle button', { hasText: 'front' }).click();
  await page.waitForTimeout(700);

  console.log(`captured ${warns.length} undefined-width events`);
  warns.forEach((w, i) => console.log(`--- event ${i + 1} ---\n${w.slice(0, 1800)}\n`));

  await browser.close();
})();
