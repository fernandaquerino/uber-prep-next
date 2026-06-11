import { test, expect } from "@playwright/test";

test.describe("Tema claro e escuro", () => {
  test("botão de tema é acessível e possui label", async ({ page }) => {
    await page.goto("/dashboard");
    const themeButton = page.getByTestId("theme-toggle");
    await expect(themeButton).toBeVisible();
    await expect(themeButton).toHaveAttribute("aria-label");
  });

  test("alternar tema muda classe no html", async ({ page }) => {
    await page.goto("/dashboard");
    const html = page.locator("html");
    const themeButton = page.getByTestId("theme-toggle");

    const initialClass = await html.getAttribute("class");
    await themeButton.click();

    // Aguarda a transição de tema
    await page.waitForTimeout(100);
    const newClass = await html.getAttribute("class");

    // A classe do html deve ter mudado (dark adicionado/removido)
    expect(newClass).not.toBe(initialClass);
  });
});
