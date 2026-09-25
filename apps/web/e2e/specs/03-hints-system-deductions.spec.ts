import { test, expect } from '@playwright/test';
import { CatalogPagePom } from '../pom/CatalogPage.pom';
import { WorkspacePagePom } from '../pom/WorkspacePage.pom';
import { HintDrawerPom } from '../pom/HintDrawer.pom';

test.describe('E2E Escenario 3: Sistema de Pistas y Deducciones (CU-04, RN-06, RN-07)', () => {
  test('debe permitir solicitar pistas con confirmación y desplegar el contenido desbloqueado', async ({ page }) => {
    const catalog = new CatalogPagePom(page);
    const workspace = new WorkspacePagePom(page);
    const hints = new HintDrawerPom(page);

    await catalog.goto();
    await catalog.selectChallenge(/3 Capas/i);

    // 1. Abrir cajón de pistas
    await hints.openDrawer();

    // 2. Desbloquear Pista 1 con confirmación modal
    await hints.unlockNextHint();

    // 3. Verificar que se renderiza el texto de la pista
    await expect(hints.drawer).toContainText(/tráfico web|balancear/i);
  });
});
