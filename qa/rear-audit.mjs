import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'qa/screenshots/rear-audit';
mkdirSync(OUT, { recursive: true });

const url = process.env.APP_URL ?? 'http://localhost:5174/';

function shot(page, name) {
  return page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
}

async function addDevice(page, namePart) {
  const card = page.locator('.device-card', { hasText: namePart }).first();
  await card.waitFor({ state: 'visible', timeout: 5000 });
  // Click adds to first available slot. Suppress dragging — use click only.
  await card.click();
  await page.waitForTimeout(220);
}

async function switchView(page, mode) {
  const btn = page.locator('.view-toggle button', { hasText: mode });
  await btn.click();
  // Wait for the flip + camera animation.
  await page.waitForTimeout(700);
}

async function clickPort(page, deviceName, portLabel) {
  // Ports are <g class="rack-port"> containing <title>LABEL — DIR</title>.
  // The label inside <title> uses an em-dash; match by partial.
  const port = page.locator('g.rack-port', {
    has: page.locator(`title:has-text("${portLabel}")`),
  });
  await port.first().waitFor({ state: 'visible', timeout: 4000 });
  await port.first().click();
  await page.waitForTimeout(150);
}

async function patchCable(page, fromLabel, toLabel) {
  await clickPort(page, '', fromLabel);
  await clickPort(page, '', toLabel);
  await page.waitForTimeout(220);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1680, height: 980 },
    deviceScaleFactor: 1.5,
  });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  console.log(`[1/8] open ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await shot(page, '01-landing');

  console.log('[2/8] enter editor → choose 12U');
  await page.locator('a.launch-button, a[href="/editor"]').first().click();
  await page.waitForSelector('.rack-config', { timeout: 5000 });
  await shot(page, '02-rack-config');
  await page.locator('.rack-options .button', { hasText: '12U' }).click();
  await page.waitForTimeout(500);

  console.log('[3/8] empty front view → flip to back');
  await shot(page, '03-empty-front');
  await switchView(page, 'back');
  await shot(page, '04-empty-back');

  console.log('[4/8] add a mix of devices (density spread)');
  await switchView(page, 'front');
  // Use the library search to narrow each device.
  const search = page.locator('.search-field input');
  const seed = async (query, deviceName) => {
    await search.fill(query);
    await page.waitForTimeout(150);
    await addDevice(page, deviceName);
    await search.fill('');
    await page.waitForTimeout(120);
  };
  await seed('Wave 1073', 'Wave 1073-A');
  await seed('Custom XLR', 'Custom XLR Bay');
  await seed('Crown', 'Crown DCi');
  await seed('Studio Fanout', 'Studio Fanout');
  await seed('1176', 'UREI 1176LN');
  await seed('Pultec', 'Pultec EQP');

  await shot(page, '05-front-loaded');

  console.log('[5/8] flip to back, audit density');
  await switchView(page, 'back');
  await shot(page, '06-back-loaded');

  // Zoom in screenshot to see densest detail
  await page.locator('button[aria-label="Zoom in"]').click({ clickCount: 3 });
  await page.waitForTimeout(300);
  await shot(page, '07-back-zoomed-in');
  await page.locator('button[aria-label="Reset camera"]').click();
  await page.waitForTimeout(400);

  console.log('[6/8] patch a bunch of cables to exercise the router');
  // Build 8+ cables: spread sources across left/right sides.
  const patches = [
    ['LINE OUT 1', 'INPUT'], // 1073 → 1176 (XLR mono)
    ['LINE OUT 2', 'XLR IN 02'], // 1073 → Fanout XLR IN 2
    ['OUTPUT', 'XLR IN 01'], // 1176 OUTPUT → Fanout XLR IN 1 (XLR analog)
    ['OUTPUTS 01', 'MIC IN 1'], // Custom XLR OUT 1 → 1073 MIC IN 1
    ['OUTPUTS 02', 'MIC IN 2'], // Custom XLR OUT 2 → 1073 MIC IN 2
    ['XLR OUT 01', 'INPUTS 03'], // Fanout XLR OUT → Custom XLR IN
    ['XLR OUT 02', 'INPUTS 04'],
    ['OUTPUT', 'INPUT'], // Pultec → 1176 (XLR analog)
  ];
  for (const [from, to] of patches) {
    try {
      await patchCable(page, from, to);
    } catch (err) {
      errors.push(`patch (${from} → ${to}) failed: ${err.message}`);
    }
  }
  await shot(page, '08-back-many-cables');

  console.log('[7/8] hover a cable to capture tooltip + focus mode');
  const firstCable = page.locator('.patch-cable').first();
  if (await firstCable.count()) {
    const box = await firstCable.boundingBox();
    if (box) {
      // Hover roughly mid-stroke
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(500);
      await shot(page, '09-cable-hover-tooltip');
    }
  }
  // Move mouse away to reset hover
  await page.mouse.move(10, 10);
  await page.waitForTimeout(300);

  console.log('[8/8] open device info panel on a complex device');
  // Click any device on the back to open the inspector
  const crownPanel = page.locator('g.rack-port').filter({
    has: page.locator('title:has-text("SPEAKER OUT")'),
  });
  if (await crownPanel.count()) {
    // We need to click on the device body, not the port. Use the name strip text.
    await page.locator('text=CROWN · CROWN DCI', { exact: false }).first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
  }
  await shot(page, '10-inspector-after-back');

  console.log('errors:', errors);
  await page.waitForTimeout(200);
  await browser.close();

  if (errors.length) {
    console.error('\nNON-FATAL ERRORS COLLECTED:');
    errors.forEach((e) => console.error(' -', e));
  }
})();
