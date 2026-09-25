import { test, expect } from '@playwright/test';
import { CatalogPagePom } from '../pom/CatalogPage.pom';
import { HeaderGamificationPom } from '../pom/HeaderGamification.pom';

test.describe('E2E Escenario 6: Persistencia de Tema y Accesibilidad (RNF-04, RNF-05, RNF-10)', () => {
  test('debe cambiar entre modo oscuro y claro y persistir la preferencia en localStorage', async ({ page }) => {
    const catalog = new CatalogPagePom(page);
    const header = new HeaderGamificationPom(page);

    await catalog.goto();

    // 1. Toggle de Tema
    await header.toggleTheme();

    // 2. Recargar y verificar persistencia
    await page.reload();
    const storedTheme = await page.evaluate(() => localStorage.getItem('awsquest_theme_mode'));
    expect(storedTheme).not.toBeNull();
  });
});
