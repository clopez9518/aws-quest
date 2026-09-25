import { Page, Locator, expect } from '@playwright/test';

export class EvaluationModalPom {
  readonly page: Page;
  readonly modalContainer: Locator;
  readonly scoreText: Locator;
  readonly passBadge: Locator;
  readonly failBadge: Locator;
  readonly feedbackItems: Locator;
  readonly retryButton: Locator;
  readonly nextChallengeButton: Locator;
  readonly guestBannerCta: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalContainer = page.getByTestId('evaluation-modal');
    this.scoreText = page.getByTestId('score-gauge-value');
    this.passBadge = page.getByTestId('evaluation-status-pass');
    this.failBadge = page.getByTestId('evaluation-status-fail');
    this.feedbackItems = page.getByTestId('feedback-item');
    this.retryButton = page.getByRole('button', { name: /reintentar solución/i });
    this.nextChallengeButton = page.getByRole('button', { name: /siguiente desafío/i });
    this.guestBannerCta = page.getByTestId('guest-progress-banner-cta');
  }

  async waitForModal() {
    await expect(this.modalContainer).toBeVisible({ timeout: 10000 });
  }

  async expectScore(expectedScore: number, passed: boolean) {
    await expect(this.scoreText).toContainText(`${expectedScore}`);
    if (passed) {
      await expect(this.passBadge).toBeVisible();
    } else {
      await expect(this.failBadge).toBeVisible();
    }
  }

  async clickRetry() {
    await this.retryButton.click();
    await expect(this.modalContainer).not.toBeVisible();
  }

  async clickRegisterFromBanner() {
    await this.guestBannerCta.click();
  }
}
