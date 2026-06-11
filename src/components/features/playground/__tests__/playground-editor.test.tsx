import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PlaygroundEditor from "../playground-editor";
import type { RunMode, SaveMeta } from "../playground";

vi.mock("next/dynamic", () => ({
  default: (
    loader: () => Promise<{ default?: React.ComponentType; Editor?: React.ComponentType }>,
  ) => {
    void loader;
    return function MockMonacoEditor(props: { value: string; onChange?: (value: string) => void }) {
      return (
        <textarea
          aria-label="Editor Monaco"
          value={props.value}
          onChange={(event) => props.onChange?.(event.target.value)}
        />
      );
    };
  },
}));

vi.mock("@monaco-editor/react", () => ({
  Editor: () => null,
}));

function setup(overrides: Partial<React.ComponentProps<typeof PlaygroundEditor>> = {}) {
  const saveMeta: SaveMeta = {
    name: "",
    topic: "",
    status: "draft",
    errorType: "",
    timeComplexity: "",
    spaceComplexity: "",
    notes: "",
  };
  const props: React.ComponentProps<typeof PlaygroundEditor> = {
    code: "console.log('ok')",
    setCode: vi.fn(),
    output: [],
    testCases: [{ input: "", expected: "" }],
    addTestCase: vi.fn(),
    removeTestCase: vi.fn(),
    updateTestCase: vi.fn(),
    testResults: [],
    running: false,
    runCode: vi.fn(),
    savePanel: true,
    setSavePanel: vi.fn(),
    saveMeta,
    setSaveMeta: vi.fn(),
    editingId: null,
    saving: false,
    onSave: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };

  render(<PlaygroundEditor {...props} />);
  return props;
}

describe("PlaygroundEditor", () => {
  it("runs code and test cases from toolbar actions", async () => {
    const user = userEvent.setup();
    const props = setup();

    await user.click(screen.getByRole("button", { name: /Run/ }));
    await user.click(screen.getByRole("button", { name: /Testar/ }));

    expect(props.runCode).toHaveBeenNthCalledWith(1, "run" satisfies RunMode);
    expect(props.runCode).toHaveBeenNthCalledWith(2, "test" satisfies RunMode);
  });

  it("updates save metadata and triggers save", async () => {
    const user = userEvent.setup();
    const setSaveMeta = vi.fn();
    const onSave = vi.fn().mockResolvedValue(undefined);
    setup({ setSaveMeta, onSave });

    await user.type(screen.getByLabelText("Nome da solução *"), "Two Sum");
    await user.click(screen.getByRole("button", { name: "Salvar solução" }));

    expect(setSaveMeta).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("shows saved output and test results", () => {
    setup({
      output: ["ok"],
      testResults: [
        {
          input: "sum(1, 2)",
          expected: "3",
          actual: "3",
          pass: true,
          isError: false,
        },
      ],
    });

    expect(screen.getByText("ok")).toBeInTheDocument();
    expect(screen.getByText("✓ passou")).toBeInTheDocument();
  });
});
