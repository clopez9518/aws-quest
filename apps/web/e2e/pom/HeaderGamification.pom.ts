import { Page, Locator, expect } from '@playwright/test';

export class HeaderGamificationPom {
  readonly page: Page;
  readonly xpText: Locator;
  readonly levelBadge: Locator;
  readonly guestBadge: Locator;
  readonly userMenuButton: Locator;
  readonly themeToggleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.xpText = page.getByTestId('header-total-xp');
    this.levelBadge = page.getByTestId('header-level-badge');
    this.guestBadge = page.getByTestId('guest-session-badge');
    this.userMenuButton = page.getByTestId('user-session-menu');
    this.themeToggleButton = page.getByTestId('theme-toggle-button');
  }

  async expectTotalXp(expectedXp: number) {
    await expect(this.xpText).toContainText(`${expectedXp}`);
  }

  async expectLevel(expectedLevel: number) {
    await expect(this.levelBadge).toHaveText(`Nivel ${expectedLevel}`);
  }

  async expectIsGuest(isGuest: boolean) {
    if (isGuest) {
      await expect(this.guestBadge).toBeVisible();
    } else {
      await expect(this.guestBadge).not.toBeVisible();
    }
  }

  async toggleTheme() {
    await this.themeToggleButton.click();
  }
}
