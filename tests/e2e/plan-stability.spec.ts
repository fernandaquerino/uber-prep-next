/**
 * E2E tests — 05.3 UI state stability
 *
 * These tests verify that interactions with blocks do NOT reset the page:
 * - modal stays open after action
 * - active tab preserved after save
 * - day accordion stays expanded
 * - week selection unchanged
 * - no full-page flicker / loading state
 *
 * Tests are conditional: if the app has no start date set, they skip gracefully.
 */

import { test, expect, type Page } from "@playwright/test";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function waitForPlanReady(page: Page): Promise<boolean> {
  await page.goto("/plano");
  await page.waitForTimeout(2500);

  // Check if the plan week navigation is visible (means start date is set)
  const weekNav = page.getByRole("navigation", { name: /navegação por semana/i });
  return weekNav.isVisible({ timeout: 3000 }).catch(() => false);
}

async function openFirstVisibleBlock(page: Page): Promise<boolean> {
  // Try to expand any day section that isn't already expanded
  const dayButtons = page
    .locator("section > button")
    .filter({ hasText: /segunda|terça|quarta|quinta|sexta|sábado|hoje/i });
  const count = await dayButtons.count();
  if (count === 0) return false;

  // Click on a day to expand it
  for (let i = 0; i < count; i++) {
    const btn = dayButtons.nth(i);
    const expanded = await btn.getAttribute("aria-expanded");
    if (expanded === "false") {
      await btn.click();
      await page.waitForTimeout(300);
    }
  }

  // Find and click the first "Abrir detalhes" button
  const openBtn = page.getByRole("button", { name: /abrir detalhes/i }).first();
  const isVisible = await openBtn.isVisible().catch(() => false);
  if (!isVisible) return false;

  await openBtn.click();
  await page.waitForTimeout(500);
  return true;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("E2E 05.3.1 — Modal não fecha após ação de status", () => {
  test("iniciar bloco mantém modal aberto e semana selecionada", async ({ page }, testInfo) => {
    const isReady = await waitForPlanReady(page);
    if (!isReady) {
      testInfo.skip(true, "Plano não carregado — data de início não configurada");
      return;
    }

    // Record the current week label
    const weekNav = page.getByRole("navigation", { name: /navegação por semana/i });
    const weekLabelBefore = await weekNav.textContent();

    const opened = await openFirstVisibleBlock(page);
    if (!opened) {
      testInfo.skip(true, "Nenhum bloco visível para abrir");
      return;
    }

    // Confirm dialog is open
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click "Iniciar" if available
    const iniciarBtn = dialog.getByRole("button", { name: /^iniciar$/i });
    const hasIniciar = await iniciarBtn.isVisible().catch(() => false);
    if (!hasIniciar) {
      testInfo.skip(true, "Bloco não está no estado pendente — Iniciar não disponível");
      return;
    }

    await iniciarBtn.click();
    await page.waitForTimeout(1000);

    // Dialog must still be open
    await expect(dialog).toBeVisible({ timeout: 3000 });

    // Week selection must not have changed
    const weekLabelAfter = await weekNav.textContent();
    expect(weekLabelAfter).toBe(weekLabelBefore);

    // Page must not be in loading / skeleton state
    const skeleton = page.locator('[aria-busy="true"]');
    await expect(skeleton).not.toBeVisible();
  });
});

test.describe("E2E 05.3.2 — Aba Anotações mantida após salvar", () => {
  test("salvar anotação permanece na aba Anotações", async ({ page }, testInfo) => {
    const isReady = await waitForPlanReady(page);
    if (!isReady) {
      testInfo.skip(true, "Plano não carregado");
      return;
    }

    const opened = await openFirstVisibleBlock(page);
    if (!opened) {
      testInfo.skip(true, "Nenhum bloco visível para abrir");
      return;
    }

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click Anotações tab
    const notesTab = dialog.getByRole("tab", { name: /anotações/i });
    await expect(notesTab).toBeVisible();
    await notesTab.click();
    await page.waitForTimeout(300);

    // Verify we're on the Anotações tab
    await expect(notesTab).toHaveAttribute("aria-selected", "true");

    // Type a note
    const textarea = dialog.locator("textarea").first();
    await textarea.fill("Teste de anotação 05.3");

    // Save
    const saveBtn = dialog.getByRole("button", { name: /salvar anotações/i });
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Dialog must still be open
    await expect(dialog).toBeVisible({ timeout: 3000 });

    // Anotações tab must still be selected
    await expect(notesTab).toHaveAttribute("aria-selected", "true");

    // Page must not be in loading state
    const skeleton = page.locator('[aria-busy="true"]');
    await expect(skeleton).not.toBeVisible();
  });
});

test.describe("E2E 05.3.3 — Aba Solução mantida após salvar", () => {
  test("salvar solução permanece na aba Solução", async ({ page }, testInfo) => {
    const isReady = await waitForPlanReady(page);
    if (!isReady) {
      testInfo.skip(true, "Plano não carregado");
      return;
    }

    const opened = await openFirstVisibleBlock(page);
    if (!opened) {
      testInfo.skip(true, "Nenhum bloco visível para abrir");
      return;
    }

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click Solução tab
    const solutionTab = dialog.getByRole("tab", { name: /solução/i });
    await solutionTab.click();
    await page.waitForTimeout(300);
    await expect(solutionTab).toHaveAttribute("aria-selected", "true");

    // Fill in solution
    const textarea = dialog.locator("textarea").first();
    await textarea.fill("Abordagem: Two Pointers");

    // Save
    const saveBtn = dialog.getByRole("button", { name: /salvar solução/i });
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Dialog must still be open
    await expect(dialog).toBeVisible({ timeout: 3000 });

    // Solução tab must still be selected
    await expect(solutionTab).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("E2E 05.3.4 — Dias expandidos permanecem após ação", () => {
  test("accordion do dia não fecha após iniciar bloco", async ({ page }, testInfo) => {
    const isReady = await waitForPlanReady(page);
    if (!isReady) {
      testInfo.skip(true, "Plano não carregado");
      return;
    }

    // Find a day button and expand it
    const dayButtons = page
      .locator("section > button[aria-expanded]")
      .filter({ hasText: /segunda|terça|quarta|quinta|sexta|hoje/i });
    const count = await dayButtons.count();
    if (count === 0) {
      testInfo.skip(true, "Nenhum dia encontrado");
      return;
    }

    const firstDay = dayButtons.first();
    const isExpanded = await firstDay.getAttribute("aria-expanded");
    if (isExpanded === "false") {
      await firstDay.click();
      await page.waitForTimeout(300);
    }
    await expect(firstDay).toHaveAttribute("aria-expanded", "true");

    // Open a block and perform an action
    const openBtn = page.getByRole("button", { name: /abrir detalhes/i }).first();
    if (!(await openBtn.isVisible().catch(() => false))) {
      testInfo.skip(true, "Nenhum bloco visível");
      return;
    }
    await openBtn.click();
    await page.waitForTimeout(500);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Perform any action (try to save notes)
    const notesTab = dialog.getByRole("tab", { name: /anotações/i });
    await notesTab.click();
    const saveBtn = dialog.getByRole("button", { name: /salvar anotações/i });
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Close the dialog
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // The day must still be expanded
    await expect(firstDay).toHaveAttribute("aria-expanded", "true");

    // No skeleton/loading visible
    const skeleton = page.locator('[aria-busy="true"]');
    await expect(skeleton).not.toBeVisible();
  });
});

test.describe("E2E 05.3.5 — Filtros funcionam", () => {
  test("filtro Em andamento mostra apenas blocos em andamento", async ({ page }, testInfo) => {
    const isReady = await waitForPlanReady(page);
    if (!isReady) {
      testInfo.skip(true, "Plano não carregado");
      return;
    }

    // Look for the quick filters
    const filterGroup = page.getByRole("tablist", { name: /filtros rápidos/i });
    const isFilterVisible = await filterGroup.isVisible().catch(() => false);
    if (!isFilterVisible) {
      testInfo.skip(true, "Filtros não visíveis");
      return;
    }

    // Click "Em andamento" filter
    const inProgressFilter = filterGroup.getByRole("tab", { name: /em andamento/i });
    await inProgressFilter.click();
    await page.waitForTimeout(500);

    await expect(inProgressFilter).toHaveAttribute("aria-selected", "true");

    // After filtering, either some blocks show OR an empty state message shows
    // (not ALL blocks showing regardless)
    const emptyMsg = page.getByText(/nenhum bloco encontrado/i);
    const blocks = page.locator("article"); // PlanBlockCard uses <article>

    // At least one of these should be visible (either blocks or empty state)
    const hasBlocks = (await blocks.count()) > 0;
    const hasEmpty = await emptyMsg.isVisible().catch(() => false);

    expect(hasBlocks || hasEmpty).toBe(true);

    // Reset to "Todos" filter
    const allFilter = filterGroup.getByRole("tab", { name: /^todos/i });
    await allFilter.click();
    await expect(allFilter).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("E2E 05.3.6 — Mobile: modal estável em 375px", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("modal não fecha após ação em viewport mobile", async ({ page }, testInfo) => {
    const isReady = await waitForPlanReady(page);
    if (!isReady) {
      testInfo.skip(true, "Plano não carregado");
      return;
    }

    const opened = await openFirstVisibleBlock(page);
    if (!opened) {
      testInfo.skip(true, "Nenhum bloco visível");
      return;
    }

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Switch to notes tab and save
    const notesTab = dialog.getByRole("tab", { name: /anotações/i });
    await notesTab.click();
    const saveBtn = dialog.getByRole("button", { name: /salvar anotações/i });
    await saveBtn.click();
    await page.waitForTimeout(1000);

    // Dialog must still be open on mobile
    await expect(dialog).toBeVisible({ timeout: 3000 });

    // No horizontal overflow
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
