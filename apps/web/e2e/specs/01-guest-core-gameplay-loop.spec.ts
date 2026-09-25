import { test, expect } from '@playwright/test';
import { CatalogPagePom } from '../pom/CatalogPage.pom';
import { WorkspacePagePom } from '../pom/WorkspacePage.pom';
import { EvaluationModalPom } from '../pom/EvaluationModal.pom';
import { AuthModalPom } from '../pom/AuthModal.pom';
import { HeaderGamificationPom } from '../pom/HeaderGamification.pom';

test.describe('E2E Escenario 1: Core Gameplay Loop & Migración de Invitado (CU-01 a CU-08)', () => {
  test('debe permitir a un invitado resolver un desafío, ganar XP y migrar su progreso a una cuenta permanente', async ({ page }) => {
    const catalog = new CatalogPagePom(page);
    const workspace = new WorkspacePagePom(page);
    const evaluation = new EvaluationModalPom(page);
    const authModal = new AuthModalPom(page);
    const header = new HeaderGamificationPom(page);

    // 1. Acceso inicial como Invitado
    await catalog.goto();
    await header.expectIsGuest(true);
    await header.expectTotalXp(0);
    await header.expectLevel(1);

    // 2. Selección de Desafío 101 (EC2)
    await catalog.selectChallenge(/Servidor Web Básico en EC2|EC2/i);

    // 3. Diseño de Arquitectura (Drag EC2 instance)
    await workspace.dragServiceToCanvas('AWS_EC2', 450, 250);

    // 4. Enviar Solución
    await workspace.submitSolution();

    // 5. Verificación de Resultados en Modal
    await evaluation.waitForModal();
    await evaluation.expectScore(100, true);

    // 6. Migración a Cuenta Permanente desde Banner
    await evaluation.clickRegisterFromBanner();
    const uniqueEmail = `hero_${Date.now()}@awsquest.io`;
    await authModal.register('Cloud Hero', uniqueEmail, 'StrongPassword123!');

    // 7. Verificación de Progreso Conservado Post-Migración
    await header.expectIsGuest(false);
    await header.expectTotalXp(100);
    await header.expectLevel(1);

    // 8. Retorno al Catálogo y Verificación de Récord
    await page.goto('/catalog');
    const completedCard = page.getByTestId('challenge-card').filter({ hasText: /EC2/i });
    await expect(completedCard.getByTestId('high-score-badge')).toBeVisible();
  });
});
