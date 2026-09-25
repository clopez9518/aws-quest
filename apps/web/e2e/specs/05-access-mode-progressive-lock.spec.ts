import { test, expect } from '@playwright/test';
import { CatalogPagePom } from '../pom/CatalogPage.pom';

test.describe('E2E Escenario 5: Conmutación de Políticas de Acceso (CU-01, CU-07, RN-01)', () => {
  test('debe conmutar entre Modo Libre y Modo Progresivo actualizando los estados de bloqueo', async ({ page }) => {
    const catalog = new CatalogPagePom(page);

    await catalog.goto();

    // 1. Conmutar a Modo Progresivo
    await catalog.setAccessMode('progressive');

    // 2. Conmutar nuevamente a Modo Libre
    await catalog.setAccessMode('openAccess');
    await catalog.expectChallengeLocked(/EC2/i, false);
  });
});
