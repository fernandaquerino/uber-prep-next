import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageHeader } from "../page-header";

describe("PageHeader", () => {
  it("renderiza o título", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("renderiza a descrição quando fornecida", () => {
    render(<PageHeader title="Dashboard" description="Visão geral do progresso." />);
    expect(screen.getByText("Visão geral do progresso.")).toBeInTheDocument();
  });

  it("não renderiza descrição quando ausente", () => {
    render(<PageHeader title="Plano" />);
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("renderiza ações quando fornecidas", () => {
    render(<PageHeader title="Dashboard" actions={<button>Ação</button>} />);
    expect(screen.getByRole("button", { name: "Ação" })).toBeInTheDocument();
  });

  it("não renderiza área de ações quando ausente", () => {
    const { container } = render(<PageHeader title="Dashboard" />);
    const actionsDiv = container.querySelector("[class*='items-center gap-2']");
    expect(actionsDiv).not.toBeInTheDocument();
  });
});
