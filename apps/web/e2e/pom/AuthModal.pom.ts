import { Page, Locator, expect } from '@playwright/test';

export class AuthModalPom {
  readonly page: Page;
  readonly modal: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitRegisterButton: Locator;
  readonly submitLoginButton: Locator;
  readonly tabRegister: Locator;
  readonly tabLogin: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByTestId('auth-modal');
    this.nameInput = page.getByTestId('auth-name-input');
    this.emailInput = page.getByTestId('auth-email-input');
    this.passwordInput = page.getByTestId('auth-password-input');
    this.submitRegisterButton = page.getByTestId('auth-submit-register');
    this.tabRegister = page.getByTestId('auth-tab-register');
    this.tabLogin = page.getByTestId('auth-tab-login');
  }

  async register(name: string, email: string, pass: string) {
    await expect(this.modal).toBeVisible();
    if (await this.tabRegister.isVisible()) {
      await this.tabRegister.click();
    }
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitRegisterButton.click();
    await expect(this.modal).not.toBeVisible({ timeout: 5000 });
  }
}
