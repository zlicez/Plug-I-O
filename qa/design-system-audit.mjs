import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'qa/screenshots/design-system';
mkdirSync(OUT, { recursive: true });

const url = process.env.APP_URL ?? 'http://localhost:5174/';

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
  console.log(`  ↳ ${name}.png`);
}

async function dismissConfigurator(page) {
  // The Rack configurator is a Radix Dialog that blocks the editor until a
  // frame size is picked. Pick 12U inside the modal, not the topbar chip.
  const twelve = page.locator('.rack-config button:has-text("12U")').first();
  if (await twelve.isVisible({ timeout: 1500 }).catch(() => false)) {
    await twelve.click();
    await page.waitForTimeout(500);
  }
}

async function switchView(page, mode) {
  // Segmented control inside the top bar.
  const button = page.locator(`button:has-text("${mode.toUpperCase()}")`).first();
  await button.click({ timeout: 5000 });
  await page.waitForTimeout(700);
}

async function run() {
  const browser = await chromium.launch();
  try {
    // Desktop
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    page.on('pageerror', (err) => console.error('  ‼ pageerror:', err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.error('  ‼ console.error:', msg.text());
    });

    // 1. Landing
    console.log('Landing (desktop)…');
    await page.goto(url);
    await page.waitForTimeout(400);
    await shot(page, '01-landing-desktop');

    // 2. Frame configurator
    console.log('Frame configurator…');
    await page.goto(`${url}editor`);
    await page.waitForTimeout(600);
    await shot(page, '02-frame-config');

    // 3. Empty editor with configurator open
    console.log('Configurator + empty editor (modal open)…');
    await shot(page, '03-configurator-modal');

    // Dismiss configurator
    await dismissConfigurator(page);
    await page.waitForTimeout(400);
    console.log('Empty editor…');
    await shot(page, '03b-empty-editor');

    // 4. Library with grid view
    console.log('Library grid…');
    await page.locator('aside#device-library').waitFor({ state: 'visible' });
    await shot(page, '04-library-grid');

    // Add devices through the store directly — UI clicks on library cards can
    // accidentally hit filter chips in the same column, which would just
    // activate filters and leave the rack empty.
    console.log('Adding devices via store…');
    await page.evaluate(() => {
      const wrapper = window;
      const ids = ['wave-1073-a', 'urei-1176ln-reissue', 'graceDesign-m108'];
      // Fall back to the first three devices the store sees if those IDs miss.
      // @ts-ignore
      if (!wrapper.__rackStore && wrapper.dispatchEvent) {
        // No public window hook; trigger by simulating clicks on the first 3
        // draggable buttons (containing svg) — but we already saw that's
        // fragile. Instead, locate the library buttons that own a child
        // div.aspect-[4/1.2] (grid card preview).
      }
    });
    // Click only buttons in the library results that have an aspect-card child.
    const gridResults = page.locator('div.grid.grid-cols-2 > button');
    const cardCount = Math.min(3, await gridResults.count());
    console.log(`  grid cards: ${await gridResults.count()}, adding ${cardCount}`);
    for (let i = 0; i < cardCount; i += 1) {
      const card = gridResults.nth(i);
      await card.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => undefined);
      await card.dispatchEvent('click');
      await page.waitForTimeout(280);
    }
    await page.waitForTimeout(400);
    await shot(page, '05-devices-placed-front');

    // 5. Click first installed device to see inspector
    console.log('Inspector — device…');
    const firstInstalled = page.locator('button.installed-interaction').first();
    if (await firstInstalled.count()) {
      await firstInstalled.dispatchEvent('click');
      await page.waitForTimeout(400);
      await shot(page, '06-inspector-device-overview');

      // Try Ports tab
      const portsTab = page.getByRole('button', { name: /^ports$/i }).first();
      if (await portsTab.isVisible().catch(() => false)) {
        await portsTab.click();
        await page.waitForTimeout(200);
        await shot(page, '07-inspector-device-ports');
      }
      const specsTab = page.getByRole('button', { name: /^specs$/i }).first();
      if (await specsTab.isVisible().catch(() => false)) {
        await specsTab.click();
        await page.waitForTimeout(200);
        await shot(page, '08-inspector-device-specs');
      }
    }

    // 6. Switch to rear view
    console.log('Rear view…');
    await switchView(page, 'rear');
    await shot(page, '09-rear-view');

    // 7. Hover a port (best-effort)
    console.log('Port hover…');
    const port = page.locator('svg g[role="button"]').first();
    if (await port.count()) {
      try {
        await port.dispatchEvent('mouseenter');
        await page.waitForTimeout(250);
        await shot(page, '10-rear-port-hover');
        await port.dispatchEvent('mouseleave');
      } catch {
        console.log('  (port hover skipped)');
      }
    }

    // 8. Library: open filters, list view, empty search
    console.log('Library filters…');
    await switchView(page, 'front');
    const filterBtn = page.getByRole('button', { name: /Toggle filters/i }).first();
    if (await filterBtn.isVisible().catch(() => false)) {
      await filterBtn.click();
      await page.waitForTimeout(200);
      await shot(page, '11-library-filters-open');
    }
    const listToggle = page.getByRole('button', { name: /Show as list/i }).first();
    if (await listToggle.isVisible().catch(() => false)) {
      await listToggle.click();
      await page.waitForTimeout(200);
      await shot(page, '12-library-list');
    }

    // Search no-results
    const search = page.getByPlaceholder(/search devices/i);
    if (await search.isVisible().catch(() => false)) {
      await search.fill('zzzzzzzzz');
      await page.waitForTimeout(400);
      await shot(page, '13-library-empty-search');
      await search.fill('');
      await page.waitForTimeout(200);
    }

    // 9. Top bar — export menu
    console.log('Export menu…');
    const exportBtn = page.getByRole('button', { name: /^Export$/ }).first();
    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();
      await page.waitForTimeout(300);
      await shot(page, '14-export-menu');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    // 10. Top bar — shortcuts modal
    console.log('Shortcuts modal…');
    const helpBtn = page.getByRole('button', { name: /keyboard shortcuts/i }).first();
    if (await helpBtn.isVisible().catch(() => false)) {
      await helpBtn.click();
      await page.waitForTimeout(300);
      await shot(page, '15-shortcuts-modal');
      await page.keyboard.press('Escape');
    }

    // 11. Top bar — clear confirm
    console.log('Clear confirm…');
    const clearBtn = page.getByRole('button', { name: /clear rack/i }).first();
    const clearDisabled = await clearBtn.isDisabled().catch(() => true);
    if (!clearDisabled) {
      await clearBtn.click();
      await page.waitForTimeout(300);
      await shot(page, '16-clear-confirm');
      await page.keyboard.press('Escape');
    } else {
      console.log('  (clear disabled — rack is empty, skipping)');
    }

    await ctx.close();

    // Mobile (390 × 844)
    console.log('Mobile editor…');
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mp = await mobile.newPage();
    await mp.goto(`${url}editor`);
    await mp.waitForTimeout(600);
    await shot(mp, '20-editor-mobile');
    await mobile.close();
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
