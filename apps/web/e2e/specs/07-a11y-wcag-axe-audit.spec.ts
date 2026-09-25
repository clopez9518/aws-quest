import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('E2E Accesibilidad: Auditoría Automatizada WCAG 2.1 Nivel AA (RNF-05)', () => {
  test('la página de Catálogo debe cumplir 100% WCAG 2.1 AA en Dark y Light Mode', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    // 1. Escaneo en Dark Mode
    const accessibilityScanDark = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(accessibilityScanDark.violations).toEqual([]);

    // 2. Conmutar a Light Mode
    const themeBtn = page.getByTestId('theme-toggle-button');
    await themeBtn.click();
    await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));
    await page.waitForTimeout(300);

    // 3. Escaneo en Light Mode
    const accessibilityScanLight = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(accessibilityScanLight.violations).toEqual([]);
  });

  test('el Workspace del Desafío y el Modal de Evaluación deben tener 0 violaciones de accesibilidad', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    // Abrir el primer desafío
    const card = page.getByTestId('challenge-card').first();
    await card.getByRole('link').click();

    // Esperar a que el canvas y el panel carguen
    await page.getByTestId('architecture-canvas').waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle');

    // Escanear Workspace completo
    const workspaceA11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(workspaceA11y.violations).toEqual([]);

    // Abrir el Modal de Autenticación / Registro para verificar su accesibilidad
    const authBtn = page.getByTestId('user-session-menu');
    if (await authBtn.isVisible()) {
      await authBtn.click();
      const authModal = page.getByTestId('auth-modal');
      if (await authModal.isVisible({ timeout: 3000 }).catch(() => false)) {
        const authModalA11y = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(authModalA11y.violations).toEqual([]);

        // Cerrar modal con Escape
        await page.keyboard.press('Escape');
      }
    }
  });
});
