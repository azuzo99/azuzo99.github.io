import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { hrefs, talkData, aboutData } from './harness/C-data';

// Component C: #about, #community, Talk, YouTube facade (design.md §5, §10).
const isPhone = (page: Page) => (page.viewportSize()?.width ?? 0) < 600;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const about = (page: Page) => page.locator('#about');

test.describe('@C about', () => {
  test('photo is present, sized (or aspect box) and lazy', async ({ page }) => {
    const img = about(page).locator('img[alt="Adam Zuzo"]');
    await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute('loading', 'lazy');
    const sized = await img.evaluate((el: HTMLImageElement) => {
      const hasAttrs = el.hasAttribute('width') && el.hasAttribute('height');
      let n: HTMLElement | null = el;
      let aspect = false;
      while (n && n.id !== 'about') {
        if (getComputedStyle(n).aspectRatio !== 'auto') aspect = true;
        n = n.parentElement;
      }
      return hasAttrs || aspect;
    });
    expect(sized).toBe(true);
  });

  test('"Full experience" link is hidden on phone, visible with LinkedIn href elsewhere', async ({ page }) => {
    // includeHidden: getByRole skips display:none elements, which is how phone hides it.
    const link = about(page).getByRole('link', { name: aboutData.experienceLabel, includeHidden: true });
    await expect(link).toHaveCount(1); // present in the DOM, only hidden by CSS on phone
    if (isPhone(page)) {
      await expect(link).toBeHidden();
    } else {
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', hrefs.linkedin);
    }
  });

  test('stats are stacked in a column from 600px and side by side in a row on phone', async ({ page }) => {
    const stats = about(page).locator('[data-test=stat]');
    const a = stats.nth(0);
    const b = stats.nth(1);
    await a.scrollIntoViewIfNeeded();
    await expect(a).toBeVisible();
    await expect(b).toBeVisible();
    const [ba, bb] = [await a.boundingBox(), await b.boundingBox()];
    expect(ba && bb).toBeTruthy();
    if (isPhone(page)) {
      expect(Math.abs(bb!.y - ba!.y)).toBeLessThan(20);
      expect(bb!.x).toBeGreaterThan(ba!.x + 40);
    } else {
      expect(bb!.y).toBeGreaterThan(ba!.y + 20);
      expect(Math.abs(bb!.x - ba!.x)).toBeLessThan(20);
    }
  });

  test('certification cards: AWS detail and Claude badge variant per band', async ({ page }) => {
    const sec = about(page);
    await expect(sec.getByText(aboutData.certsLabel)).toBeVisible();
    await expect(sec.getByText(aboutData.certAwsTitle)).toBeVisible();
    await expect(sec.getByText('Claude Certified Architect')).toBeVisible();
    const detail = sec.getByText(aboutData.certAwsDetail);
    const badge = sec.getByText(new RegExp(`^${aboutData.badgeShort}`)).locator('visible=true');
    await expect(badge).toHaveCount(1);
    if (isPhone(page)) {
      await expect(detail).toBeHidden();
      await expect(badge).toHaveText(aboutData.badgeShort);
    } else {
      await expect(detail).toBeVisible();
      await expect(badge).toHaveText(aboutData.badge);
    }
  });

  test('both dark cards link to #community', async ({ page }) => {
    const cards = about(page).locator('a[href="#community"]');
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText(aboutData.speakerTitle);
    await expect(cards.nth(1)).toContainText(aboutData.communitiesTitle);
  });
});

test.describe('@C community', () => {
  const cards = (page: Page) => page.locator('[data-test=community], [data-test=talk]');

  test('has two community cards and one talk card', async ({ page }) => {
    await expect(page.locator('#community [data-test=community]')).toHaveCount(2);
    await expect(page.locator('#community [data-test=talk]')).toHaveCount(1);
  });

  test('phone: cards start collapsed and expand independently', async ({ page }) => {
    test.skip(!isPhone(page), 'phone only');
    const c0 = page.locator('[data-test=community]').nth(0);
    const c1 = page.locator('[data-test=community]').nth(1);
    const talk = page.locator('[data-test=talk]');
    for (const c of [c0, c1, talk]) {
      await expect(c.locator('button[aria-expanded=false]').first()).toBeVisible();
    }
    await expect(c0.getByRole('link', { name: /Meetup/ })).toBeHidden();
    await c0.locator('button[aria-expanded]').first().click();
    await expect(c0.locator('button[aria-expanded=true]').first()).toBeVisible();
    await expect(c0.getByRole('link', { name: /Meetup/ })).toBeVisible();
    await expect(c1.locator('button[aria-expanded=false]').first()).toBeVisible();
    await talk.locator('button[aria-expanded]').first().click();
    await expect(talk.locator('button[aria-expanded=true]').first()).toBeVisible();
    // both stay open (multiple allowed)
    await expect(c0.locator('button[aria-expanded=true]').first()).toBeVisible();
    await expect(page.locator('[data-test=video-facade]')).toBeVisible();
  });

  test('phone toggles have a hit area of at least 44px', async ({ page }) => {
    test.skip(!isPhone(page), 'phone only');
    const toggles = page.locator('#community [data-test=community] button[aria-expanded], #community [data-test=talk] button[aria-expanded]');
    await expect(toggles).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const box = await toggles.nth(i).boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('>=600: content always visible and no toggles', async ({ page }) => {
    test.skip(isPhone(page), '>=600 only');
    await expect(cards(page)).toHaveCount(3);
    await expect(page.locator('#community [data-test=community] button[aria-expanded], #community [data-test=talk] button[aria-expanded]')).toHaveCount(0);
    await expect(page.locator('[data-test=community]').nth(0).getByRole('link', { name: /Meetup/ })).toBeVisible();
    await expect(page.locator('[data-test=community]').nth(1).getByRole('link', { name: /Meetup/ })).toBeVisible();
    await expect(page.locator('[data-test=video-facade]')).toBeVisible();
  });

  test('Claude photo uses object-position center 62%', async ({ page }) => {
    const card = page.locator('[data-test=community]').nth(0);
    if (isPhone(page)) await card.locator('button[aria-expanded]').first().click();
    const img = card.locator('img[alt="Claude Community Poznan meetup group photo"]');
    await expect(img).toBeVisible();
    const pos = await img.evaluate((el) => getComputedStyle(el).objectPosition);
    expect(pos).toMatch(/^(50%|center) 62%$/);
  });

  test('Meetup and Luma links carry the data hrefs', async ({ page }) => {
    const c0 = page.locator('[data-test=community]').nth(0);
    const c1 = page.locator('[data-test=community]').nth(1);
    if (isPhone(page)) {
      await c0.locator('button[aria-expanded]').first().click();
      await c1.locator('button[aria-expanded]').first().click();
    }
    await expect(c0.getByRole('link', { name: /^Meetup/ })).toHaveAttribute('href', hrefs.meetupClaude);
    await expect(c0.getByRole('link', { name: /^Luma/ })).toHaveAttribute('href', hrefs.lumaClaude);
    await expect(c1.getByRole('link', { name: /^Meetup/ })).toHaveAttribute('href', hrefs.meetupAws);
  });
});

test.describe('@C video facade', () => {
  async function revealTalk(page: Page) {
    if (isPhone(page)) {
      await page.locator('[data-test=talk] button[aria-expanded]').first().click();
    }
  }

  test('before click: no youtube/ytimg request, thumbnail is local, button has an accessible name', async ({ page }) => {
    const hosts: string[] = [];
    page.on('request', (r) => hosts.push(new URL(r.url()).hostname));
    await page.goto('/');
    await revealTalk(page);
    const facade = page.locator('[data-test=video-facade]');
    await facade.scrollIntoViewIfNeeded();
    await expect(facade).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(hosts.filter((h) => /youtube|ytimg|ggpht|googlevideo/.test(h))).toEqual([]);
    const urls = await facade.evaluate((el) => {
      const out: string[] = [];
      const bg = getComputedStyle(el).backgroundImage;
      for (const m of bg.matchAll(/url\("?(.*?)"?\)/g)) out.push(m[1]);
      el.querySelectorAll('img').forEach((i) => out.push(i.currentSrc || i.src));
      return out;
    });
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(new URL(u, page.url()).hostname).toBe('localhost');
    await expect(page.getByRole('button', { name: talkData.playLabel })).toBeVisible();
  });

  test('click replaces facade with the nocookie iframe', async ({ page }) => {
    await revealTalk(page);
    const facade = page.locator('[data-test=video-facade]');
    await facade.scrollIntoViewIfNeeded();
    await facade.click();
    const frame = page.locator('iframe[data-test=video]');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('src', talkData.embedUrl);
    await expect(frame).toHaveAttribute('title', talkData.iframeTitle);
    await expect(page.locator('[data-test=video-facade]')).toHaveCount(0);
  });
});

test.describe('@C a11y', () => {
  test('axe on #about and #community: no serious/critical (color-contrast excluded)', async ({ page }) => {
    // Guard: real content must be present, otherwise an empty placeholder passes trivially.
    await expect(about(page).getByText(aboutData.certsLabel)).toBeVisible();
    await expect(page.locator('#community [data-test=talk]')).toHaveCount(1);
    const res = await new AxeBuilder({ page })
      .include('#about')
      .include('#community')
      .disableRules(['color-contrast'])
      .analyze();
    const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});
