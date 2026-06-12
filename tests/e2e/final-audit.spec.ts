import { expect, test } from "@playwright/test";

test.describe("Entrega 17 — auditoria final", () => {
  test("módulos principais renderizam um heading e não exibem erro fatal", async ({ page }) => {
    const routes = [
      "/dashboard",
      "/plano",
      "/revisar",
      "/flashcards",
      "/quizzes",
      "/timer",
      "/mocks",
      "/playground",
      "/notas",
      "/recursos",
      "/relatorios",
      "/configuracoes",
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("h1").first(), `${route} sem título principal`).toBeVisible();
      await expect(page.getByText("Internal Server Error")).toHaveCount(0);
    }
  });

  test("importação inválida é rejeitada e reset total pode ser cancelado", async ({ page }) => {
    await page.goto("/configuracoes");
    await page.getByRole("tab", { name: "Dados e Backup" }).click();

    await page.locator("#import-file").setInputFiles({
      name: "backup-invalido.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"app":"outro-app","data":{}}'),
    });
    await expect(page.getByText(/backup inválido|arquivo inválido/i).first()).toBeVisible();

    await page.getByRole("button", { name: "Apagar todos os dados" }).click();
    const dialog = page.getByRole("dialog", { name: "Apagar todos os dados?" });
    await expect(dialog.getByRole("button", { name: "Apagar tudo" })).toBeDisabled();
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("configurações e relatórios não causam overflow em 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    for (const route of ["/configuracoes", "/relatorios"]) {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(dimensions.scrollWidth, `overflow em ${route}`).toBeLessThanOrEqual(
        dimensions.clientWidth + 2,
      );
    }
  });
});
