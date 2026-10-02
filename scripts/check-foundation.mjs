import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = 'http://127.0.0.1:4173';
const artifacts = path.join(root, '.artifacts');
await mkdir(artifacts, { recursive: true });
const server = spawn(
  process.execPath,
  [
    path.join(root, 'node_modules/vite/bin/vite.js'),
    'preview',
    '--host',
    '127.0.0.1',
    '--port',
    '4173',
    '--strictPort',
  ],
  { cwd: path.join(root, 'client'), stdio: 'pipe', windowsHide: true },
);
let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += chunk;
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk;
});
let browser;
let passed = 0;
const errors = [];

async function check(label, run) {
  await run();
  passed += 1;
  console.log('PASS ' + label);
}

async function assertTheme(page, expected) {
  await page.waitForFunction(
    (dark) => document.documentElement.classList.contains('dark') === dark,
    expected === 'dark',
  );
}

function watchPage(page) {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(response.status() + ' ' + response.url());
  });
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error('Preview failed: ' + serverOutput);
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* The preview process is still starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Preview server must start.');
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PORTFOLIO_BROWSER_CHANNEL
      ? { channel: process.env.PORTFOLIO_BROWSER_CHANNEL }
      : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'light',
  });
  const page = await context.newPage();
  watchPage(page);
  await page.goto(origin);
  await page.getByRole('heading', { name: /Shahzaib/ }).waitFor();
  await page.evaluate(() => document.fonts.ready);

  await check('desktop layout, fonts, and exact light palette', async () => {
    await assertTheme(page, 'light');
    assert.equal(
      await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
      'rgb(245, 242, 236)',
    );
    assert.ok(
      await page.evaluate(
        () =>
          document.fonts.check('16px "Inter Variable"') &&
          document.fonts.check('16px "Fraunces Variable"'),
      ),
    );
    assert.equal(await page.getByRole('navigation', { name: 'Main navigation' }).count(), 1);
    await page.goto(origin + '/#about');
    await page.locator('footer ul[aria-label="Find me online"]').waitFor();
    assert.equal(await page.locator('footer ul[aria-label="Find me online"] li').count(), 7);
    await page.goto(origin);
    assert.equal(await page.locator('a[href*="["]').count(), 0);
    assert.ok((await page.locator('a[href="/resume.pdf"]').count()) > 0, 'Resume links are live.');
    await page.screenshot({
      path: path.join(artifacts, 'phase-1-desktop-light.png'),
      fullPage: true,
      animations: 'disabled',
    });
  });

  await check(
    'system theme updates; explicit choice survives system changes and reload',
    async () => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await assertTheme(page, 'dark');
      await page.getByRole('button', { name: 'Switch to light mode' }).click();
      await assertTheme(page, 'light');
      await page.emulateMedia({ colorScheme: 'light' });
      await page.emulateMedia({ colorScheme: 'dark' });
      await assertTheme(page, 'light');
      await page.reload();
      await assertTheme(page, 'light');
      assert.equal(await page.evaluate(() => localStorage.getItem('portfolio-theme')), 'light');
      await page.getByRole('button', { name: 'Switch to dark mode' }).click();
      await assertTheme(page, 'dark');
      assert.equal(
        await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
        'rgb(17, 18, 20)',
      );
      await page.screenshot({
        path: path.join(artifacts, 'phase-1-desktop-dark.png'),
        fullPage: true,
        animations: 'disabled',
      });
    },
  );

  await check('theme synchronizes across tabs and can return to the system setting', async () => {
    const secondTab = await context.newPage();
    watchPage(secondTab);
    await secondTab.goto(origin);
    await assertTheme(secondTab, 'dark');
    await secondTab.getByRole('button', { name: 'Switch to light mode' }).click();
    await assertTheme(page, 'light');
    await page.goto(origin + '/#about');
    await page.getByRole('button', { name: 'Use device theme' }).click();
    await assertTheme(page, 'dark');
    assert.equal(await page.evaluate(() => localStorage.getItem('portfolio-theme')), null);
    await secondTab.close();
  });

  await check('keyboard skip link and section links focus their targets', async () => {
    await page.goto(origin);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').innerText(), 'Skip to content');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator(':focus').getAttribute('id'), 'main-content');
    await page.getByRole('link', { name: 'Explore Systems', exact: true }).click();
    await page.waitForURL('**/#projects');
    await page.waitForFunction(() => document.activeElement?.id === 'projects');
    assert.equal(
      await page
        .getByRole('navigation')
        .getByRole('link', { name: 'Systems', exact: true })
        .first()
        .getAttribute('aria-current'),
      'location',
    );
  });

  await check('mobile menu keyboard, Escape, link selection, and resize behavior', async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(origin);
    const menu = page.getByRole('button', { name: 'Open navigation menu' });
    await menu.focus();
    await page.keyboard.press('Enter');
    assert.equal(
      await page
        .getByRole('button', { name: 'Close navigation menu' })
        .getAttribute('aria-expanded'),
      'true',
    );
    await page.keyboard.press('Tab');
    assert.match(await page.locator(':focus').innerText(), /Architecture/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator(':focus').getAttribute('aria-label'), 'Open navigation menu');
    assert.equal(await page.locator('#mobile-navigation').isVisible(), false);
    await menu.click();
    await page.locator('#mobile-navigation').getByRole('link', { name: 'Credentials' }).click();
    assert.equal(await page.locator('#mobile-navigation').isVisible(), false);
    await page.waitForFunction(() => document.activeElement?.id === 'credentials');
    await menu.click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.waitForFunction(() => document.querySelector('#mobile-navigation').hidden);
    await page.setViewportSize({ width: 375, height: 812 });
    assert.equal(await page.locator('#mobile-navigation').isVisible(), false);
    await page.goto(origin);
    await page.emulateMedia({ colorScheme: 'light' });
    await assertTheme(page, 'light');
    await page.screenshot({
      path: path.join(artifacts, 'phase-1-mobile-light.png'),
      fullPage: true,
      animations: 'disabled',
    });
  });

  await check('no horizontal overflow at phone, tablet, and desktop widths', async () => {
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        'Overflow at ' + width,
      );
    }
  });

  await check('reduced motion and unknown-route recovery', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(
      await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
      'auto',
    );
    await page.goto(origin + '/missing-page');
    await page.getByRole('heading', { name: 'Nothing here, yet.' }).waitFor();
    await page.getByRole('link', { name: 'Back to home', exact: true }).click();
    await page.getByRole('heading', { name: /Shahzaib/ }).waitFor();
  });

  await check('unavailable browser storage does not break initialization or toggling', async () => {
    const restricted = await browser.newContext({ colorScheme: 'dark' });
    await restricted.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('Storage blocked');
        },
      });
    });
    const restrictedPage = await restricted.newPage();
    watchPage(restrictedPage);
    await restrictedPage.goto(origin);
    await restrictedPage.getByRole('heading', { name: /Shahzaib/ }).waitFor();
    await assertTheme(restrictedPage, 'dark');
    await restrictedPage.getByRole('button', { name: 'Switch to light mode' }).click();
    await assertTheme(restrictedPage, 'light');
    await restricted.close();
  });

  await check('no browser console errors, page exceptions, or failed HTTP responses', async () => {
    assert.deepEqual(errors, []);
  });
  console.log('\n' + passed + ' browser checks passed. Screenshots saved to .artifacts/.');
} finally {
  await browser?.close();
  server.kill();
}
