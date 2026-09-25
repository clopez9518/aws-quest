import { test, expect } from '@playwright/test';

test.describe('E2E Accesibilidad: Flujo de Usuario 100% por Teclado (WCAG 2.1.1 Operable)', () => {
  test('un usuario puede navegar por el catálogo, acceder con Skip Link y operar desafíos solo con teclado', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    // 1. Probar Skip Link
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /saltar al contenido principal/i });
    await expect(skipLink).toBeFocused();

    // Activar Skip Link con Enter
    await page.keyboard.press('Enter');
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();

    // 2. Enfocar y activar el primer desafío mediante teclado
    const challengeLink = page.getByRole('link', { name: /(iniciar|mejorar puntaje en) desafío/i }).first();
    await challengeLink.focus();
    await expect(challengeLink).toBeFocused();

    // 3. Abrir el desafío con Enter
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/challenges\/.+/);
    await page.getByTestId('architecture-canvas').waitFor({ state: 'visible' });

    // 4. Abrir y cerrar el modal de confirmación de reinicio o pistas usando teclado
    const hintsBtn = page.getByTestId('hints-trigger-button');
    await hintsBtn.focus();
    await page.keyboard.press('Enter');

    const hintDrawer = page.getByTestId('hint-drawer');
    await expect(hintDrawer).toBeVisible();

    // Cerrar drawer de pistas
    const closeHintsBtn = page.getByTestId('close-hint-drawer-button');
    await closeHintsBtn.focus();
    await page.keyboard.press('Enter');
    await expect(hintDrawer).toBeHidden();
  });
});
