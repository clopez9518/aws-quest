import { Page, Locator, expect } from '@playwright/test';

export class CatalogPagePom {
  readonly page: Page;
  readonly catalogTitle: Locator;
  readonly accessModeToggle: Locator;
  readonly openAccessButton: Locator;
  readonly progressiveAccessButton: Locator;
  readonly unitCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.catalogTitle = page.getByRole('heading', { name: /catálogo de desafíos/i });
    this.accessModeToggle = page.getByTestId('access-mode-toggle');
    this.openAccessButton = page.getByRole('button', { name: /libre/i });
    this.progressiveAccessButton = page.getByRole('button', { name: /progresivo/i });
    this.unitCards = page.getByTestId('unit-accordion');
  }

  async goto() {
    await this.page.goto('/catalog');
    await expect(this.catalogTitle).toBeVisible();
  }

  async selectChallenge(title: string | RegExp) {
    const card = this.page.getByTestId('challenge-card').filter({ hasText: title });
    await expect(card).toBeVisible({ timeout: 10000 });
    
    // Clic en el enlace de inicio del desafío
    const actionLink = card.getByRole('link');
    if (await actionLink.isVisible()) {
      await actionLink.click();
    } else {
      await card.click();
    }
    await this.page.waitForURL(/\/challenges\/.+/, { timeout: 10000 });
  }

  async setAccessMode(mode: 'openAccess' | 'progressive') {
    if (mode === 'openAccess') {
      await this.openAccessButton.click();
    } else {
      await this.progressiveAccessButton.click();
    }
    await this.page.waitForTimeout(400);
  }

  async expectChallengeLocked(title: string | RegExp, isLocked: boolean) {
    const card = this.page.getByTestId('challenge-card').filter({ hasText: title });
    if (isLocked) {
      await expect(card.getByTestId('lock-icon')).toBeVisible();
    } else {
      await expect(card.getByTestId('lock-icon')).not.toBeVisible();
    }
  }
}
