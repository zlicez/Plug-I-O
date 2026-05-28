import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'qa/screenshots/rear-audit';
mkdirSync(OUT, { recursive: true });
const url = process.env.APP_URL ?? 'http://localhost:5174/';

const shot = (page, name) => page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });

async function clickPort(page, portLabel) {
  const port = page.locator('g.rack-port', {
    has: page.locator(`title:has-text("${portLabel}")`),
  });
  await port.first().waitFor({ state: 'visible', timeout: 4000 });
  await port.first().scrollIntoViewIfNeeded();
  await port.first().click();
  await page.waitForTimeout(120);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1680, height: 980 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('a[href="/editor"]').first().click();
  await page.waitForSelector('.rack-config');
  await page.locator('.rack-options .button', { hasText: '12U' }).click();
  await page.waitForTimeout(400);

  // Seed 4 devices for clean cable demo
  const search = page.locator('.search-field input');
  for (const [q, name] of [
    ['Wave 1073', 'Wave 1073-A'],
    ['1176', 'UREI 1176LN'],
    ['Studio Fanout', 'Studio Fanout'],
    ['Custom XLR', 'Custom XLR Bay'],
  ]) {
    await search.fill(q);
    await page.waitForTimeout(150);
    await page.locator('.device-card', { hasText: name }).first().click();
    await page.waitForTimeout(180);
    await search.fill('');
  }

  // Switch to back, reset camera
  await page.locator('.view-toggle button', { hasText: 'back' }).click();
  await page.waitForTimeout(700);
  await page.locator('button[aria-label="Reset camera"]').click();
  await page.waitForTimeout(300);

  // Patch: build a couple of clean valid cables
  await clickPort(page, 'LINE OUT 1');
  await clickPort(page, 'INPUT'); // 1073 → 1176
  await clickPort(page, 'LINE OUT 2');
  await clickPort(page, 'XLR IN 01'); // 1073 → Fanout
  await clickPort(page, 'OUTPUT');
  await clickPort(page, 'XLR IN 02'); // 1176 → Fanout
  await clickPort(page, 'OUTPUTS 01');
  await clickPort(page, 'MIC IN 1'); // Custom XLR → 1073 mic
  await clickPort(page, 'OUTPUTS 02');
  await clickPort(page, 'MIC IN 2');
  await page.waitForTimeout(300);
  await shot(page, '11-clean-cables');

  // Use SVG getPointAtLength so the cursor lands ON the routed path (its bounding box
  // includes empty area around Manhattan corners; midpoint of bbox is rarely on the path).
  const cablePoint = await page.evaluate(() => {
    const path = document.querySelector('.cable-group .patch-cable-hit');
    if (!path) return null;
    const svg = path.ownerSVGElement;
    if (!svg) return null;
    const length = path.getTotalLength();
    const svgPt = path.getPointAtLength(length * 0.45);
    const screenPt = svgPt.matrixTransform(svg.getScreenCTM());
    return { x: screenPt.x, y: screenPt.y };
  });
  if (cablePoint) {
    await page.mouse.move(cablePoint.x, cablePoint.y);
    await page.waitForTimeout(400);
    await shot(page, '12-cable-tooltip-hover');
    await page.waitForTimeout(600);
    await shot(page, '13-cable-tooltip-settled');
  }

  // Zoom in and screenshot rear of a single device for label/name-strip quality
  await page.locator('button[aria-label="Zoom in"]').click({ clickCount: 5 });
  await page.waitForTimeout(400);
  await shot(page, '14-back-zoomed-detail');

  // Hover a port to see compatibility highlights (was working before)
  await page.locator('button[aria-label="Reset camera"]').click();
  await page.waitForTimeout(300);
  await clickPort(page, 'LINE OUT 1');
  await page.waitForTimeout(200);
  await shot(page, '15-armed-source-state');
  // Move mouse over a port (hover)
  const compat = page.locator('g.rack-port', {
    has: page.locator('title:has-text("INPUT")'),
  }).first();
  await compat.hover();
  await page.waitForTimeout(300);
  await shot(page, '16-hover-compat-port');

  console.log('errors:', errors);
  await browser.close();

  if (errors.length) {
    console.error('\nNON-FATAL ERRORS:');
    errors.forEach((e) => console.error(' -', e));
  }
})();
