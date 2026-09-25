import { Page, Locator, expect } from '@playwright/test';

export class AttemptHistoryPom {
  readonly page: Page;
  readonly historyTab: Locator;
  readonly attemptCards: Locator;
  readonly restoreModal: Locator;
  readonly confirmRestoreButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.historyTab = page.getByRole('tab', { name: /historial/i });
    this.attemptCards = page.getByTestId('attempt-history-card');
    this.restoreModal = page.getByTestId('restore-attempt-modal');
    this.confirmRestoreButton = this.restoreModal.getByRole('button', { name: /reemplazar y cargar/i });
  }

  async openHistoryTab() {
    await this.historyTab.click();
  }

  async restoreFirstAttempt() {
    await expect(this.attemptCards.first()).toBeVisible({ timeout: 10000 });
    const loadButton = this.attemptCards.first().getByTestId('restore-attempt-button');
    await loadButton.click();
    if (await this.restoreModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.confirmRestoreButton.click();
      await expect(this.restoreModal).not.toBeVisible();
    }
  }
}
