import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ThemeToggle } from "../theme-toggle";

// Radix Tooltip requires a provider — wrap in a stub
function Wrapper({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

describe("ThemeToggle", () => {
  it("possui label acessível", () => {
    render(
      <Wrapper>
        <ThemeToggle />
      </Wrapper>,
    );
    // mock retorna theme: "dark", então label deve ser "Mudar para tema claro"
    const button = screen.getByRole("button", { name: /mudar para tema claro/i });
    expect(button).toBeInTheDocument();
  });

  it("tem data-testid para identificação em testes", () => {
    render(
      <Wrapper>
        <ThemeToggle />
      </Wrapper>,
    );
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("chama setTheme ao clicar", async () => {
    const user = userEvent.setup();
    const { useTheme } = await import("next-themes");
    const setThemeMock = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      setTheme: setThemeMock,
      resolvedTheme: "dark",
      themes: ["light", "dark", "system"],
      systemTheme: "dark",
      forcedTheme: undefined,
    });

    render(
      <Wrapper>
        <ThemeToggle />
      </Wrapper>,
    );

    await user.click(screen.getByTestId("theme-toggle"));
    expect(setThemeMock).toHaveBeenCalledWith("light");
  });
});
