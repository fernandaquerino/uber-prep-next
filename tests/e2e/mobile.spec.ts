import { test, expect } from "@playwright/test";

test.describe("Navegação mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("sidebar desktop está oculta no mobile", async ({ page }) => {
    await page.goto("/dashboard");
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeHidden();
  });

  test("botão de menu é visível no mobile", async ({ page }) => {
    await page.goto("/dashboard");
    const menuButton = page.getByRole("button", { name: /abrir menu/i });
    await expect(menuButton).toBeVisible();
  });

  test("abre o menu e exibe navegação", async ({ page }) => {
    await page.goto("/dashboard");
    const menuButton = page.getByRole("button", { name: /abrir menu/i });
    await menuButton.click();

    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("link", { name: /dashboard/i })).toBeVisible();
  });

  test("navega e fecha o menu ao selecionar uma rota", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /abrir menu/i }).click();

    // Clica no link do Plano dentro do sheet
    const sheet = page.getByRole("dialog");
    await sheet.getByRole("link", { name: /^plano$/i }).click();

    // URL deve ter mudado
    await expect(page).toHaveURL("/plano");

    // Sheet deve ter fechado
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
