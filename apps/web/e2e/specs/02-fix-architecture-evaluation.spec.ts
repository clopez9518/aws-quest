import { test, expect } from '@playwright/test';
import { CatalogPagePom } from '../pom/CatalogPage.pom';
import { WorkspacePagePom } from '../pom/WorkspacePage.pom';
import { EvaluationModalPom } from '../pom/EvaluationModal.pom';
import { HeaderGamificationPom } from '../pom/HeaderGamification.pom';

test.describe('E2E Escenario 2: Iteración, Corrección de Errores y Anti-Farmeo (CU-02, CU-03, CU-05, RN-10)', () => {
  test('debe evaluar una arquitectura incompleta, permitir reintento y calcular XP anti-farmeo correctamente', async ({ page }) => {
    const catalog = new CatalogPagePom(page);
    const workspace = new WorkspacePagePom(page);
    const evaluation = new EvaluationModalPom(page);
    const header = new HeaderGamificationPom(page);

    await catalog.goto();

    // 1. Abrir desafío 201 (3 Capas)
    await catalog.selectChallenge(/3 Capas/i);

    // 2. Colocar arquitectura defectuosa con solo RDS
    await workspace.dragServiceToCanvas('AWS_RDS', 450, 350);

    // 3. Enviar solución incompleta
    await workspace.submitSolution();
    await evaluation.waitForModal();
    await evaluation.expectScore(0, false);

    // 4. Reintentar solución (conserva canvas)
    await evaluation.clickRetry();

    // 5. Reiniciar Canvas usando el modal accesible
    await workspace.resetCanvas();

    // 6. Verificar que el total de XP se mantiene en 0 tras fallar
    await header.expectTotalXp(0);
  });
});
