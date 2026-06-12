import { expect, test } from "@playwright/test";

test.describe("Entrega 16 — Relatórios semanais", () => {
  test("rota renderiza e mantém o estado local-first", async ({ page }) => {
    await page.goto("/relatorios");
    await expect(page.getByRole("heading", { name: "Relatórios" })).toBeVisible();

    const noStartDate = page.getByText(/data de início não configurada/i);
    if (await noStartDate.isVisible().catch(() => false)) {
      await expect(page.getByRole("link", { name: /configurar data de início/i })).toBeVisible();
      return;
    }

    await expect(page.getByLabel("Semana")).toBeVisible();
    await expect(page.getByRole("button", { name: /markdown/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /pdf.*imprimir/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /reflexão semanal/i })).toBeVisible();
  });

  test("não cria overflow horizontal em mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/relatorios");
    const dimensions = await page.evaluate(() => ({
      scroll: document.body.scrollWidth,
      client: document.body.clientWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 2);
  });
});
