import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:5173';
const apiOrigin = process.env.PORTFOLIO_API_URL || 'http://127.0.0.1:3001';
await mkdir('.artifacts', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PORTFOLIO_BROWSER_CHANNEL
    ? { channel: process.env.PORTFOLIO_BROWSER_CHANNEL }
    : {}),
});
const errors = [];
let passed = 0;

async function check(name, run) {
  await run();
  passed += 1;
  console.log('PASS ' + name);
}

async function newContext(options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'light',
    ...options,
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return { context, page };
}

const animationState = (page, selector) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        name: style.animationName,
        state: style.animationPlayState,
        transform: style.transform,
        opacity: style.opacity,
      };
    });

try {
  const { context, page } = await newContext();
  await page.goto(origin);
  await page.locator('.hero').waitFor();
  await page.evaluate(() => document.fonts.ready);

  await check('the home page is locked to one screen', async () => {
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1),
    );
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => window.scrollY), 0);
  });

  await check('prompt chips and typed questions open grounded answers', async () => {
    await page.getByRole('button', { name: 'Is he available for hire?', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Ask about Shahzaib' });
    await drawer.waitFor();
    await drawer.getByText('Notice period: Immediate Start.').waitFor();
    assert.match(await drawer.textContent(), /From: Status/);
    await page.locator('#drawer-input').fill('what is his tech stack');
    await page.keyboard.press('Enter');
    await drawer.getByText(/Backend: FastAPI, Node\.js/).waitFor();
    // An unrelated question gets an honest "not on this portfolio" answer.
    await page.locator('#drawer-input').fill('favourite pizza topping');
    await page.keyboard.press('Enter');
    await drawer.getByText(/didn't find that here/).waitFor();
    await page.keyboard.press('Escape');
    await drawer.waitFor({ state: 'detached' });
  });

  await check('the hero search bar opens the drawer', async () => {
    await page.locator('#ask-input').fill('How can I contact him?');
    await page.keyboard.press('Enter');
    const drawer = page.getByRole('dialog', { name: 'Ask about Shahzaib' });
    await drawer
      .getByText(/shahzaibkhalid\.eng@gmail\.com/)
      .first()
      .waitFor();
    await page.getByRole('button', { name: 'Close answers' }).click();
    await drawer.waitFor({ state: 'detached' });
  });

  await check(
    'navbar items open sections in a full-screen overlay that Escape closes',
    async () => {
      await page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Credentials', exact: true })
        .click();
      const overlay = page.getByRole('dialog', { name: 'Credentials' });
      await overlay.waitFor();
      await page.waitForFunction(() => document.activeElement?.id === 'credentials');
      await page.keyboard.press('Escape');
      await overlay.waitFor({ state: 'detached' });
      assert.equal(new URL(page.url()).hash, '');
    },
  );

  await check('the skills page pulls every skill logo into the black hole', async () => {
    await page.goto(origin + '/#skills');
    await page.waitForFunction(() => document.activeElement?.id === 'skills');
    const logos = page.locator('.black-hole .bh-logo');
    assert.equal(await logos.count(), 23);
    assert.equal(await page.locator('.skills-group').count(), 6);
    const position = () => logos.first().evaluate((node) => node.style.transform);
    const before = await position();
    await page.waitForTimeout(300);
    assert.notEqual(await position(), before, 'Logos must orbit.');
    await page.goto(origin + '/#experience');
    await page.getByRole('heading', { name: /Software Engineer \(Full Stack & AI\)/ }).waitFor();
    await page.getByText('Cloudtek · Islamabad, Pakistan').waitFor();
  });

  await check(
    'Architecture shows the layers pyramid, and Skills has its own nav item',
    async () => {
      await page.goto(origin + '/#layers');
      const picks = page.locator('.pyramid-pick');
      await picks.first().waitFor();
      assert.deepEqual(await picks.allTextContents(), [
        'Interface',
        'Intelligence',
        'Services',
        'Data',
        'Delivery',
      ]);
      assert.equal(await page.locator('.pyramid-tier').count(), 5);
      await page.getByRole('button', { name: 'Services', exact: true }).click();
      await page.locator('.pyramid-detail-name', { hasText: 'Services' }).waitFor();
      await page.locator('.pyramid-detail').getByText('FastAPI', { exact: true }).waitFor();
      assert.equal(
        await page
          .getByRole('button', { name: 'Services', exact: true })
          .getAttribute('aria-pressed'),
        'true',
      );
      await page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Skills', exact: true })
        .click();
      await page.waitForFunction(() => document.activeElement?.id === 'skills');
      assert.equal(await page.getByRole('dialog', { name: 'Skills' }).count(), 1);
    },
  );

  await check('each section page has its own theme', async () => {
    const themes = {
      about: ['pyramids', '.pyramids-art'],
      skills: ['space', '.space-art'],
      projects: ['mars', '.mars-art'],
      credentials: ['dimension', '.dimension-art'],
      status: ['desert', '.desert-art'],
    };
    for (const [hash, [theme, art]] of Object.entries(themes)) {
      await page.goto(origin + '/#' + hash);
      await page.locator(art).waitFor();
      assert.equal(await page.locator('.section-overlay').getAttribute('data-theme'), theme, hash);
    }
    assert.notEqual((await animationState(page, '.desert-sun')).name, 'none');
    // The tesseract is redrawn every frame from its 4D rotation.
    await page.goto(origin + '/#credentials');
    const edge = page.locator('.tesseract-edge').first();
    await edge.waitFor({ state: 'attached' });
    assert.equal(await page.locator('.tesseract-edge').count(), 32);
    const before = await edge.getAttribute('x1');
    await page.waitForTimeout(300);
    assert.notEqual(await edge.getAttribute('x1'), before, 'The tesseract must rotate.');
  });

  await check('the hero particle network moves and reacts to the pointer', async () => {
    await page.goto(origin);
    await page.waitForTimeout(400);
    const field = page.locator('.hero .particle-field');
    assert.equal(await field.getAttribute('data-moving'), 'true');
    const first = await field.screenshot();
    await page.waitForTimeout(300);
    assert.ok(!first.equals(await field.screenshot()), 'Particles must drift.');
  });

  await check('the symbiote cursor grabs, absorbs into targets, and bursts on click', async () => {
    const litPixels = (x, y, w, h) =>
      page.locator('.venom-cursor').evaluate(
        (canvas, [x, y, w, h]) => {
          const ratio = canvas.width / window.innerWidth;
          const data = canvas
            .getContext('2d')
            .getImageData(x * ratio, y * ratio, w * ratio, h * ratio).data;
          let lit = 0;
          for (let i = 3; i < data.length; i += 4) if (data[i] > 40) lit++;
          return lit;
        },
        [x, y, w, h],
      );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).cursor), 'none');
    // An open spot in the hero at least 100px from anything the cursor can grab.
    const quiet = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll('[data-symbiote-target]')].map((element) =>
        element.getBoundingClientRect(),
      );
      const gap = (x, y) =>
        Math.min(
          ...boxes.map((box) =>
            Math.hypot(
              Math.max(box.left - x, 0, x - box.right),
              Math.max(box.top - y, 0, y - box.bottom),
            ),
          ),
        );
      for (let y = 120; y < window.innerHeight - 120; y += 20) {
        for (let x = 120; x < window.innerWidth - 120; x += 20) {
          if (gap(x, y) > 100) return { x, y };
        }
      }
      return null;
    });
    assert.ok(quiet, 'The hero needs an open area for the cursor checks.');
    for (let i = 0; i <= 20; i++)
      await page.mouse.move(quiet.x + 100 - i * 5, quiet.y - 40 + i * 2);
    await page.waitForTimeout(150);
    assert.ok(
      (await litPixels(quiet.x - 60, quiet.y - 60, 120, 120)) > 50,
      'The nucleus and tendrils must draw.',
    );

    // Within 60px, the tendrils reach the button and it starts to glow.
    const contact = page.getByRole('link', { name: 'Contact', exact: true });
    const button = await contact.boundingBox();
    assert.ok(button);
    await page.mouse.move(button.x + button.width + 35, button.y + button.height / 2, { steps: 8 });
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('[data-symbiote-target]')].find(
          (element) => element.textContent?.trim() === 'Contact',
        )?.dataset.symbioteActive === 'true',
    );
    let bridge = 0;
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(80);
      bridge = Math.max(
        bridge,
        await litPixels(button.x + button.width - 20, button.y - 4, 60, button.height + 8),
      );
    }
    assert.ok(bridge > 60, 'Tendrils must bridge the gap to the button.');

    // Inside, the button is magnetically pulled toward the pointer.
    await page.mouse.move(button.x + button.width - 12, button.y + 10, { steps: 6 });
    await page.waitForTimeout(500);
    const pull = await contact.evaluate((element) =>
      parseFloat(element.style.getPropertyValue('--sym-mx')),
    );
    assert.ok(pull > 2, 'The button must lean toward the pointer.');

    // Leaving releases it.
    await page.mouse.move(quiet.x, quiet.y, { steps: 10 });
    await page.waitForFunction(
      () => !document.querySelector('[data-symbiote-active="true"]'),
      undefined,
      { timeout: 3000 },
    );

    // A click launches droplets well beyond the resting nucleus.
    await page.waitForTimeout(300);
    const before = await litPixels(quiet.x - 100, quiet.y - 100, 200, 200);
    await page.mouse.down();
    await page.waitForTimeout(120);
    const during = await litPixels(quiet.x - 100, quiet.y - 100, 200, 200);
    await page.mouse.up();
    assert.ok(during > before * 1.5, `Click blast must light up the area (${before} → ${during}).`);
    await page.mouse.move(quiet.x, quiet.y, { steps: 5 });
  });

  await check('code window tabs switch the file', async () => {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    const code = page.locator('.code-body');
    await page.getByRole('tab', { name: 'schema.sql' }).click();
    assert.equal(await code.getAttribute('data-file'), 'schema.sql');
    assert.equal(
      await page.getByRole('tab', { name: 'schema.sql' }).getAttribute('aria-selected'),
      'true',
    );
    await page.waitForFunction(() =>
      document.querySelector('.code-body')?.textContent?.includes('CREATE EXTENSION'),
    );
    await page.mouse.move(5, 5);
  });

  await check('the left dock lists profiles with tooltips', async () => {
    const dock = page.getByRole('navigation', { name: 'Profiles' });
    assert.equal(await dock.locator('li').count(), 7);
    const first = dock.locator('.dock-link').first();
    await first.hover();
    await page.waitForTimeout(300);
    assert.equal(
      await first.locator('.dock-tip').evaluate((tip) => getComputedStyle(tip).opacity),
      '1',
    );
    await page.mouse.move(5, 5);
  });

  await check('the page fills the viewport at desktop and ultrawide sizes', async () => {
    for (const width of [1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 1000 });
      const bounds = await page.locator('#top').boundingBox();
      assert.ok(bounds && Math.round(bounds.width) === width);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  });

  await check('the black hole pauses when scrolled out of view', async () => {
    await page.goto(origin + '/#skills');
    await page.setViewportSize({ width: 1440, height: 500 });
    await page.locator('footer').scrollIntoViewIfNeeded();
    // Give the visibility observer a moment to report that the stage left the screen.
    await page.waitForTimeout(400);
    const logo = page.locator('.bh-logo').first();
    const parked = await logo.evaluate((node) => node.style.transform);
    await page.waitForTimeout(300);
    assert.equal(await logo.evaluate((node) => node.style.transform), parked);
    await page.setViewportSize({ width: 1440, height: 1000 });
  });

  await check('small screens show the skills page without overflow', async () => {
    const mobile = await newContext({ viewport: { width: 375, height: 900 } });
    await mobile.page.goto(origin + '/#skills');
    await mobile.page.locator('.black-hole').waitFor();
    assert.ok(
      await mobile.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    );
    await mobile.page.screenshot({ path: '.artifacts/skills-mobile.png' });
    await mobile.context.close();
  });

  await check('reduced motion stills the black hole and turns off the cursor trail', async () => {
    const quiet = await newContext({ reducedMotion: 'reduce' });
    await quiet.page.goto(origin + '/#skills');
    await quiet.page.locator('.black-hole').waitFor();
    assert.equal(await quiet.page.locator('.venom-cursor').count(), 0);
    assert.notEqual(
      await quiet.page.evaluate(() => getComputedStyle(document.body).cursor),
      'none',
    );
    assert.equal(await quiet.page.locator('.particle-field').getAttribute('data-moving'), 'false');
    assert.equal(await quiet.page.locator('.black-hole').getAttribute('data-moving'), 'false');
    assert.equal((await animationState(quiet.page, '.bh-disk i')).name, 'none');
    await quiet.context.close();
  });

  await check('backend responds directly and through the frontend proxy', async () => {
    for (const url of [apiOrigin + '/api/health', origin + '/api/health']) {
      const response = await fetch(url);
      assert.equal(response.status, 200, url);
      const body = await response.json();
      assert.equal(body.service, 'portfolio-api');
      assert.equal(body.status, 'ok');
      assert.equal(body.database.connected, false);
    }
  });

  await check('the updated pages have no browser errors', async () => assert.deepEqual(errors, []));
  await context.close();
  console.log('\n' + passed + ' enhancement checks passed.');
} finally {
  await browser.close();
}
