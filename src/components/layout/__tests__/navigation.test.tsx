import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AppSidebar } from "../app-sidebar";
import { NAV_ITEMS } from "../navigation-items";

describe("Navegação (AppSidebar)", () => {
  it("renderiza todos os itens de navegação", () => {
    render(<AppSidebar />);
    for (const item of NAV_ITEMS) {
      expect(screen.getByRole("link", { name: new RegExp(item.label, "i") })).toBeInTheDocument();
    }
  });

  it("marca o item ativo conforme pathname", () => {
    // usePathname está mockado para /dashboard no setup
    render(<AppSidebar />);
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("itens inativos não têm aria-current", () => {
    render(<AppSidebar />);
    const planoLink = screen.getByRole("link", { name: /^plano$/i });
    expect(planoLink).not.toHaveAttribute("aria-current");
  });

  it("cada link aponta para o href correto", () => {
    render(<AppSidebar />);
    for (const item of NAV_ITEMS) {
      const link = screen.getByRole("link", { name: new RegExp(item.label, "i") });
      expect(link).toHaveAttribute("href", item.href);
    }
  });
});
