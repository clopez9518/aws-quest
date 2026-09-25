import { test, expect } from '@playwright/test';
import { CatalogPagePom } from '../pom/CatalogPage.pom';
import { WorkspacePagePom } from '../pom/WorkspacePage.pom';
import { EvaluationModalPom } from '../pom/EvaluationModal.pom';
import { AttemptHistoryPom } from '../pom/AttemptHistory.pom';

test.describe('E2E Escenario 4: Auditoría e Historial de Intentos (CU-05, CU-06, RN-11)', () => {
  test('debe registrar intentos de evaluación y permitir restaurar una arquitectura previa en el canvas', async ({ page }) => {
    const catalog = new CatalogPagePom(page);
    const workspace = new WorkspacePagePom(page);
    const evaluation = new EvaluationModalPom(page);
    const history = new AttemptHistoryPom(page);

    await catalog.goto();
    await catalog.selectChallenge(/EC2/i);

    // 1. Enviar solución
    await workspace.dragServiceToCanvas('AWS_EC2', 450, 250);
    await workspace.submitSolution();
    await evaluation.waitForModal();
    await evaluation.clickRetry();

    // 2. Limpiar el canvas
    await workspace.resetCanvas();

    // 3. Abrir la pestaña Historial
    await history.openHistoryTab();

    // 4. Restaurar el intento previo
    await history.restoreFirstAttempt();

    // 5. Verificar que el canvas vuelve a contener el nodo
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  });
});
