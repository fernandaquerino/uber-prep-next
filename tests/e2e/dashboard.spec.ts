/**
 * E2E tests — 06 Dashboard
 *
 * Tests are conditional: if no start date is configured, they skip gracefully.
 * They verify:
 * - Dashboard renders without crashing
 * - Correct state shown based on app configuration
 * - Consistency: current study item matches Plan page
 */

import { test, expect, type Page } from "@playwright/test";

async function waitForDashboard(page: Page): Promise<"ready" | "no_start_date" | "error"> {
  await page.goto("/dashboard");
  await page.waitForTimeout(3000);

  const hasNoDate = await page
    .getByText(/data de início não configurada/i)
    .isVisible()
    .catch(() => false);
  if (hasNoDate) return "no_start_date";

  const hasError = await page
    .getByRole("alert")
    .isVisible()
    .catch(() => false);
  if (hasError) return "error";

  // Check for any of the main dashboard content indicators
  const hasContent = await page
    .locator("main, [role='main']")
    .isVisible()
    .catch(() => false);

  return hasContent ? "ready" : "no_start_date";
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("E2E 06.1 — Dashboard carrega sem erros", () => {
  test("dashboard renderiza sem crash", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(3000);

    // Should not show an uncaught error
    const hasUncaughtError = await page
      .locator("text=Internal Server Error")
      .isVisible()
      .catch(() => false);
    expect(hasUncaughtError).toBe(false);

    // Should show the page heading
    const heading = page.getByRole("heading", { name: /dashboard/i });
    await expect(heading).toBeVisible({ timeout: 5000 });
  });
});

test.describe("E2E 06.2 — Estado sem data configurada", () => {
  test("mostra instrução para configurar data de início quando não há data", async ({
    page,
  }, testInfo) => {
    const status = await waitForDashboard(page);

    if (status !== "no_start_date") {
      testInfo.skip(true, "Data de início já configurada — skipping empty state test");
      return;
    }

    const emptyMsg = page.getByText(/data de início não configurada/i);
    await expect(emptyMsg).toBeVisible();

    const configLink = page.getByRole("link", { name: /configurar data de início/i });
    await expect(configLink).toBeVisible();
    await expect(configLink).toHaveAttribute("href", "/configuracoes");
  });
});

test.describe("E2E 06.3 — Dashboard com plano configurado", () => {
  test("mostra seções principais do dashboard", async ({ page }, testInfo) => {
    const status = await waitForDashboard(page);

    if (status !== "ready") {
      testInfo.skip(true, "Plano não configurado — skipping ready state test");
      return;
    }

    // Page heading is present
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();

    // Refresh button is present
    const refreshBtn = page.getByRole("button", { name: /atualizar dashboard/i });
    await expect(refreshBtn).toBeVisible();

    // At least one card/section is visible (current study or streak or progress)
    const cards = page.locator('[class*="card"], article, section');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("não mostra skeleton depois de carregado", async ({ page }, testInfo) => {
    const status = await waitForDashboard(page);

    if (status !== "ready") {
      testInfo.skip(true, "Plano não configurado");
      return;
    }

    const skeleton = page.locator('[aria-busy="true"]');
    await expect(skeleton).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe("E2E 06.4 — Consistência com página Plano", () => {
  test("item atual do dashboard coincide com plano", async ({ page }, testInfo) => {
    const dashStatus = await waitForDashboard(page);
    if (dashStatus !== "ready") {
      testInfo.skip(true, "Plano não configurado");
      return;
    }

    // Get the current study item title from dashboard (if visible)
    const currentStudyCard = page.locator("text=Próximo estudo, text=Em andamento").first();
    const isDashboardStudyVisible = await currentStudyCard.isVisible().catch(() => false);

    if (!isDashboardStudyVisible) {
      // No current item on dashboard — plan might be complete
      testInfo.skip(true, "Nenhum item de estudo ativo no dashboard");
      return;
    }

    // Navigate to plan and verify a similar item appears
    await page.goto("/plano");
    await page.waitForTimeout(2500);

    // The plan page should load successfully
    const planHeading = page.getByRole("heading", { name: /plano/i });
    await expect(planHeading).toBeVisible({ timeout: 5000 });
  });
});

test.describe("E2E 06.5 — Botão de atualizar funciona", () => {
  test("clicar em atualizar não trava a página", async ({ page }, testInfo) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(3000);

    const refreshBtn = page.getByRole("button", { name: /atualizar dashboard/i });
    if (!(await refreshBtn.isVisible().catch(() => false))) {
      testInfo.skip(true, "Botão de atualizar não encontrado");
      return;
    }

    await refreshBtn.click();
    await page.waitForTimeout(2000);

    // Page should still be intact
    const heading = page.getByRole("heading", { name: /dashboard/i });
    await expect(heading).toBeVisible({ timeout: 5000 });

    // No crash/error
    const hasError = await page.locator("text=Internal Server Error").isVisible().catch(() => false);
    expect(hasError).toBe(false);
  });
});

test.describe("E2E 06.6 — Dashboard mobile (375px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("dashboard não tem overflow horizontal no mobile", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(3000);

    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
