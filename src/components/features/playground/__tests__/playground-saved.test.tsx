import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlaygroundSaved from "../playground-saved";
import type { PlaygroundSolutionRecord } from "@/types/database";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  delete: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("@/lib/db/db", () => ({
  getDb: vi.fn(() => ({})),
}));

vi.mock("@/lib/repositories/playground.repository", () => ({
  createPlaygroundRepository: vi.fn(() => mocks),
}));

const solution: PlaygroundSolutionRecord = {
  id: "solution-1",
  title: "Two Sum",
  language: "javascript",
  code: "function twoSum() {}",
  output: "",
  notes: JSON.stringify({ status: "passed", testPassRate: 100 }),
  category: "hashmap",
  createdAt: "2026-06-11T10:00:00.000Z",
  updatedAt: "2026-06-11T10:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.list.mockResolvedValue([solution]);
  mocks.delete.mockResolvedValue(undefined);
  mocks.upsert.mockResolvedValue(undefined);
});

describe("PlaygroundSaved", () => {
  it("lists saved solutions with metadata", async () => {
    render(<PlaygroundSaved onLoad={vi.fn()} />);

    expect(await screen.findByText("Two Sum")).toBeInTheDocument();
    expect(screen.getByText(/hashmap/)).toBeInTheDocument();
    expect(screen.getByText(/100% testes/)).toBeInTheDocument();
  });

  it("filters saved solutions by query", async () => {
    const user = userEvent.setup();
    render(<PlaygroundSaved onLoad={vi.fn()} />);

    await screen.findByText("Two Sum");
    await user.type(screen.getByLabelText(/Buscar soluções/), "missing");

    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
    expect(screen.getByText("Nenhuma solução salva encontrada.")).toBeInTheDocument();
  });

  it("opens, duplicates and deletes a saved solution", async () => {
    const user = userEvent.setup();
    const onLoad = vi.fn();
    render(<PlaygroundSaved onLoad={onLoad} />);

    await screen.findByText("Two Sum");
    await user.click(screen.getByRole("button", { name: "Abrir" }));
    await user.click(screen.getByRole("button", { name: "Duplicar" }));
    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onLoad).toHaveBeenCalledWith(solution);
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Two Sum (cópia)",
        code: solution.code,
      }),
    );
    expect(mocks.delete).toHaveBeenCalledWith("solution-1");
    await waitFor(() => expect(mocks.list).toHaveBeenCalledTimes(3));
  });
});
