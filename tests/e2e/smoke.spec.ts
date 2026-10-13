import { expect, test } from '@playwright/test';

const dialogs = (page: import('@playwright/test').Page) => page.getByRole('dialog');

test.describe('fun mode (Kris OS)', () => {
  test('opens a window from the dock and back-navigation closes it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'fun');

    await page.locator('[data-dock-item="about"]').click();
    const about = page.getByRole('dialog', { name: 'About' });
    await expect(about).toBeVisible();
    await expect(page).toHaveURL(/window=about/);
    // Focus moves into the window.
    await expect(about).toBeFocused();

    await page.goBack();
    await expect(about).toBeHidden();
    await expect(page).not.toHaveURL(/window=/);
    // We stayed on the site.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Escape closes the focused window', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-dock-item="timeline"]').click();
    const win = page.getByRole('dialog', { name: 'Timeline' });
    await expect(win).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(win).toBeHidden();
  });

  test('deep link /work/[slug] opens that window', async ({ page }) => {
    await page.goto('/work/first-project');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'fun');
    const win = page.getByRole('dialog', { name: /First Project/ });
    await expect(win).toBeVisible();
    await expect(win.getByRole('heading', { name: 'Overview' })).toBeVisible();
  });

  test('?window= deep link opens the window', async ({ page }) => {
    await page.goto('/?window=episodes');
    await expect(page.getByRole('dialog', { name: 'Episodes' })).toBeVisible();
  });

  test('opening a project from Episodes, then back, returns to Episodes', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('[data-dock-item="episodes"]').click();
    await page.getByRole('link', { name: /First Project/ }).click();
    await expect(page).toHaveURL(/\/work\/first-project/);
    await page.goBack();
    await expect(page.getByRole('dialog', { name: /First Project/ })).toBeHidden();
    await expect(page.getByRole('dialog', { name: 'Episodes' })).toBeVisible();
  });

  test('windowed shows all open windows, compact shows one; nothing is lost on resize', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    await page.locator('[data-dock-item="about"]').click();
    await page.locator('[data-dock-item="timeline"]').click();

    if (isMobile) {
      await expect(dialogs(page)).toHaveCount(1);
      await expect(page.getByRole('dialog', { name: 'Timeline' })).toBeVisible();
    } else {
      await expect(dialogs(page)).toHaveCount(2);
      const size = page.viewportSize()!;
      await page.setViewportSize({ width: 600, height: size.height });
      await expect(dialogs(page)).toHaveCount(1);
      await expect(page.getByRole('dialog', { name: 'Timeline' })).toBeVisible();
      await page.setViewportSize(size);
      await expect(dialogs(page)).toHaveCount(2);
    }
  });

  test('touch targets are at least 44px', async ({ page }) => {
    await page.goto('/');
    for (const item of await page.locator('[data-dock-item]').all()) {
      const box = (await item.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('mode switching', () => {
  test('wash switches to clean and back', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-switch').click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'clean');
    await expect(page).toHaveURL(/mode=clean/);

    // Cookie persists the choice for a plain visit.
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'clean');

    await page.getByTestId('mode-switch').click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'fun');
  });

  test('?mode= beats the cookie', async ({ page }) => {
    await page.goto('/?mode=clean');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'clean');
    await page.goto('/?mode=fun');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'fun');
  });
});

test.describe('clean mode', () => {
  test('renders all content', async ({ page }) => {
    await page.goto('/?mode=clean');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your Name');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Timeline' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Second Project/ })).toBeVisible();
  });

  test('deep link /work/[slug] works', async ({ page }) => {
    await page.goto('/work/second-project?mode=clean');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Second Project');
  });

  test('mobile menu: opens, contains focus, Esc closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile menu only exists below md');
    await page.goto('/?mode=clean');
    const button = page.getByRole('button', { name: 'Menu', exact: true });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await expect(menu).toBeVisible();

    // Tab around: focus may leave to browser chrome (body) but must never land
    // on the page behind the modal, which is inert.
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const ok = await page.evaluate(() => {
        const el = document.activeElement;
        return !el || el === document.body || !!el.closest('#mobile-menu');
      });
      expect(ok).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/?mode=clean');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test('sitemap and robots are served', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('/work/first-project');
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
});
