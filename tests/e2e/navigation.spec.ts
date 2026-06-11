import { test, expect } from "@playwright/test";

test.describe("Navegação principal", () => {
  test("redireciona / para /dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/dashboard");
  });

  test("página de dashboard tem título correto", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/Dashboard.*Uber Prep/);
  });

  test("navega para /revisar", async ({ page }) => {
    await page.goto("/revisar");
    await expect(page.getByRole("heading", { name: "Revisar Hoje" })).toBeVisible();
  });

  test("navega para /configuracoes", async ({ page }) => {
    await page.goto("/configuracoes");
    await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
  });

  test("todas as rotas principais respondem com 200", async ({ page }) => {
    const routes = [
      "/dashboard",
      "/plano",
      "/revisar",
      "/flashcards",
      "/quizzes",
      "/mocks",
      "/playground",
      "/notas",
      "/recursos",
      "/relatorios",
      "/configuracoes",
    ];
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `Rota ${route} falhou`).toBe(200);
    }
  });
});

// Testes dependentes da sidebar — sidebar fica visível apenas em desktop (lg:flex = ≥1024px)
// O projeto "mobile" usa Pixel 5 (393px), então esses testes são pulados no mobile.
test.describe("Navegação via sidebar (somente desktop)", () => {
  test("navega para /plano via sidebar e exibe título", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Sidebar oculta no mobile");
    await page.goto("/dashboard");
    await page
      .getByRole("link", { name: /^plano$/i })
      .first()
      .click();
    await expect(page).toHaveURL("/plano");
    await expect(page.getByRole("heading", { name: "Plano de Estudos" })).toBeVisible();
  });

  test("item ativo é destacado na sidebar", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Sidebar oculta no mobile");
    await page.goto("/plano");
    const activeLink = page.getByRole("link", { name: /^plano$/i }).first();
    await expect(activeLink).toHaveAttribute("aria-current", "page");
  });
});
