import { Page, Locator, expect } from '@playwright/test';

export class WorkspacePagePom {
  readonly page: Page;
  readonly canvasContainer: Locator;
  readonly submitButton: Locator;
  readonly resetCanvasButton: Locator;
  readonly hintsButton: Locator;
  readonly servicePalette: Locator;
  readonly contextPanelTabs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvasContainer = page.getByTestId('architecture-canvas');
    this.submitButton = page.getByTestId('submit-solution-button');
    this.resetCanvasButton = page.getByTestId('reset-canvas-button');
    this.hintsButton = page.getByTestId('hints-trigger-button');
    this.servicePalette = page.getByTestId('service-palette');
    this.contextPanelTabs = page.getByTestId('problem-context-panel-tabs');
  }

  async dragServiceToCanvas(serviceCode: string, targetX = 450, targetY = 250) {
    const serviceItem = this.page.getByTestId(`palette-item-${serviceCode}`);
    await expect(serviceItem).toBeVisible();

    // Arrastre hacia el contenedor del canvas
    await serviceItem.dragTo(this.canvasContainer, {
      targetPosition: { x: targetX, y: targetY }
    });

    // Esperar a que se instancie el nodo
    const node = this.page.locator(`.react-flow__node`);
    await expect(node.first()).toBeVisible({ timeout: 5000 });
  }

  async connectNodes(sourceNodeSelector: string, targetNodeSelector: string) {
    const sourceHandle = this.page.locator(`${sourceNodeSelector} .react-flow__handle-bottom`);
    const targetHandle = this.page.locator(`${targetNodeSelector} .react-flow__handle-top`);

    await expect(sourceHandle).toBeVisible();
    await expect(targetHandle).toBeVisible();

    await sourceHandle.dragTo(targetHandle);
    await expect(this.page.locator('.react-flow__edge')).toBeVisible({ timeout: 5000 });
  }

  async submitSolution() {
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }

  async resetCanvas() {
    await this.resetCanvasButton.click();
    const modal = this.page.getByTestId('reset-canvas-modal');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: /confirmar reinicio|reiniciar/i }).click();
    await expect(modal).not.toBeVisible();
  }
}
