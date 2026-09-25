import { Page, Locator, expect } from '@playwright/test';

export class HintDrawerPom {
  readonly page: Page;
  readonly drawer: Locator;
  readonly unlockNextButton: Locator;
  readonly hintCards: Locator;
  readonly unlockModal: Locator;
  readonly confirmUnlockButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.drawer = page.getByTestId('hint-drawer');
    this.unlockNextButton = page.getByTestId('unlock-next-hint-button');
    this.hintCards = page.getByTestId('hint-card');
    this.unlockModal = page.getByTestId('hint-unlock-modal');
    this.confirmUnlockButton = this.unlockModal.getByTestId('confirm-unlock-hint-button');
  }

  async openDrawer() {
    await this.page.getByTestId('hints-trigger-button').click();
    await expect(this.drawer).toBeVisible();
  }

  async unlockNextHint() {
    await expect(this.unlockNextButton).toBeEnabled();
    await this.unlockNextButton.click();
    await expect(this.unlockModal).toBeVisible();
    await this.confirmUnlockButton.click();
    await expect(this.unlockModal).not.toBeVisible();
  }
}
