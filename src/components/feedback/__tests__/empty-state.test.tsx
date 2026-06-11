import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("renderiza o título", () => {
    render(<EmptyState title="Nenhum resultado" />);
    expect(screen.getByText("Nenhum resultado")).toBeInTheDocument();
  });

  it("renderiza a descrição quando fornecida", () => {
    render(<EmptyState title="Nenhum resultado" description="Adicione um item para começar." />);
    expect(screen.getByText("Adicione um item para começar.")).toBeInTheDocument();
  });

  it("funciona sem descrição", () => {
    const { container } = render(<EmptyState title="Vazio" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renderiza a ação quando fornecida", () => {
    render(<EmptyState title="Vazio" action={<button>Criar</button>} />);
    expect(screen.getByRole("button", { name: "Criar" })).toBeInTheDocument();
  });

  it("renderiza o ícone quando fornecido", () => {
    render(<EmptyState title="Vazio" icon={<span data-testid="icon">⭐</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("tem role status para acessibilidade", () => {
    render(<EmptyState title="Sem dados" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
