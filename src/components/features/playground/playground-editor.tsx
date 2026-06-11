import { Button } from "@/components/ui/button";
import type { RunMode, SaveMeta, TestCase, TestResult } from "./playground";
import { cn } from "@/lib/utils";
import type { Dispatch, SetStateAction } from "react";
import dynamic from "next/dynamic";
import { PlaygroundEditorSkeleton } from "./playground-skeleton";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => <PlaygroundEditorSkeleton />,
});

const ERROR_TYPES = [
  "padrão errado",
  "edge case",
  "complexidade",
  "bug de implementação",
  "comunicação",
  "teste insuficiente",
];

type PlaygroundEditorProps = {
  code: string;
  setCode: (code: string) => void;
  output: string[];
  testCases: TestCase[];
  addTestCase: () => void;
  removeTestCase: (i: number) => void;
  updateTestCase: (i: number, field: keyof TestCase, val: string) => void;
  testResults: TestResult[];
  running: boolean;
  runCode: (mode: RunMode) => void;
  savePanel: boolean;
  setSavePanel: Dispatch<SetStateAction<boolean>>;
  saveMeta: SaveMeta;
  setSaveMeta: Dispatch<SetStateAction<SaveMeta>>;
  editingId: string | null;
  saving: boolean;
  onSave: () => Promise<void>;
};

export default function PlaygroundEditor({
  code,
  setCode,
  output,
  testCases,
  addTestCase,
  removeTestCase,
  updateTestCase,
  testResults,
  running,
  runCode,
  savePanel,
  setSavePanel,
  saveMeta,
  setSaveMeta,
  editingId,
  saving,
  onSave,
}: PlaygroundEditorProps) {
  return (
    <>
      <div className="mb-2.5 flex flex-wrap gap-2">
        <Button variant="secondary" size="lg" disabled={running} onClick={() => runCode("run")}>
          {running ? "⏳ executando…" : "▶ Run"}
        </Button>
        <Button variant="secondary" size="lg" disabled={running} onClick={() => runCode("test")}>
          ⚡ Testar
        </Button>
        <Button variant="secondary" size="lg" onClick={() => setSavePanel((p) => !p)}>
          {editingId ? "💾 Atualizar" : "💾 Salvar"}
        </Button>
      </div>

      {savePanel && (
        <div className="border-border mb-3 rounded-lg border p-4">
          <label
            htmlFor="playground-save-name"
            className="mt-2.5 mb-1 block font-mono text-[10px] font-semibold tracking-[0.08em] uppercase"
          >
            Nome da solução *
          </label>

          <input
            id="playground-save-name"
            className="border-border box-border w-full rounded-lg border px-2.5 py-[7px] font-mono text-xs outline-none"
            placeholder="ex: Two Sum — Hash Map"
            value={saveMeta.name}
            onChange={(e) =>
              setSaveMeta((previous) => ({
                ...previous,
                name: e.target.value,
              }))
            }
          />

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            <div>
              <label
                htmlFor="playground-save-topic"
                className="mt-2.5 mb-1 block font-mono text-[10px] font-semibold tracking-[0.08em] uppercase"
              >
                Tópico
              </label>

              <input
                id="playground-save-topic"
                className="border-border box-border w-full rounded-lg border p-2.5 font-mono text-xs outline-none"
                placeholder="ex: Sliding Window, Debounce"
                value={saveMeta.topic}
                onChange={(e) =>
                  setSaveMeta((previous) => ({
                    ...previous,
                    topic: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label
                htmlFor="playground-save-status"
                className="mt-2.5 mb-1 block font-mono text-[10px] font-semibold tracking-[0.08em] uppercase"
              >
                Status
              </label>

              <select
                id="playground-save-status"
                className="border-border box-border w-full rounded-lg border p-2.5 font-mono text-xs outline-none"
                value={saveMeta.status}
                onChange={(e) =>
                  setSaveMeta((previous) => ({
                    ...previous,
                    status: e.target.value,
                  }))
                }
              >
                <option value="draft">rascunho</option>
                <option value="passed">passou</option>
                <option value="needs_review">revisar</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="playground-save-error-type"
                className="mt-2.5 mb-1 block font-mono text-[10px] font-semibold tracking-[0.08em] uppercase"
              >
                Erro principal
              </label>

              <select
                id="playground-save-error-type"
                className="border-border box-border w-full rounded-lg border p-2.5 font-mono text-xs outline-none"
                value={saveMeta.errorType}
                onChange={(e) =>
                  setSaveMeta((previous) => ({
                    ...previous,
                    errorType: e.target.value,
                  }))
                }
              >
                <option value="">nenhum</option>

                {ERROR_TYPES.map((errorType) => (
                  <option key={errorType} value={errorType}>
                    {errorType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            <div>
              <label
                htmlFor="playground-save-time-complexity"
                className="mt-2.5 mb-1 block font-mono text-[10px] font-semibold tracking-[0.08em] uppercase"
              >
                Complexidade temporal
              </label>

              <input
                id="playground-save-time-complexity"
                className="border-border box-border w-full rounded-lg border px-2.5 py-[7px] font-mono text-xs outline-none"
                placeholder="O(n)"
                value={saveMeta.timeComplexity}
                onChange={(e) =>
                  setSaveMeta((previous) => ({
                    ...previous,
                    timeComplexity: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label
                htmlFor="playground-save-space-complexity"
                className="mt-2.5 mb-1 block font-mono text-[10px] font-semibold tracking-[0.08em] uppercase"
              >
                Complexidade espacial
              </label>

              <input
                id="playground-save-space-complexity"
                className="border-border box-border w-full rounded-lg border p-2.5 font-mono text-xs outline-none"
                placeholder="O(n)"
                value={saveMeta.spaceComplexity}
                onChange={(e) =>
                  setSaveMeta((previous) => ({
                    ...previous,
                    spaceComplexity: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <label
            htmlFor="playground-save-notes"
            className="mt-2.5 mb-1 block font-mono text-[10px] font-semibold tracking-[0.08em] uppercase"
          >
            Anotações
          </label>

          <textarea
            id="playground-save-notes"
            className="border-border min-h-14 w-full resize-y rounded-lg border p-2.5 font-mono text-xs leading-[1.6] outline-none"
            placeholder="Observações sobre a solução..."
            value={saveMeta.notes}
            onChange={(e) =>
              setSaveMeta((previous) => ({
                ...previous,
                notes: e.target.value,
              }))
            }
          />

          <div className="mt-3 flex gap-2">
            <Button disabled={saving} onClick={() => void onSave()}>
              {saving ? "Salvando..." : editingId ? "Atualizar solução" : "Salvar solução"}
            </Button>

            <Button variant="secondary" onClick={() => setSavePanel(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="border-border mb-3 overflow-hidden rounded-lg border">
        <MonacoEditor
          height="380px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v || "")}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
      <div className="mb-4">
        <p className="mb-2 font-mono text-[10px] font-semibold tracking-widest uppercase">
          Console
        </p>
        <div className="border-border max-h-56 min-h-20 overflow-y-auto rounded-lg border p-3.5 font-mono text-xs leading-[1.7]">
          {output.length === 0 ? (
            // eslint-disable-next-line react/jsx-no-comment-textnodes
            <span style={{ color: "#333" }}>// output aparece aqui</span>
          ) : (
            output.map((line, i) => {
              const isError =
                line.startsWith("[erro") ||
                line.startsWith("[error") ||
                line.startsWith("[timeout]");

              return (
                <div
                  key={i}
                  className={`break-all whitespace-pre-wrap ${
                    isError ? "text-[#FF6B9D]" : "text-[#A0C0A0]"
                  }`}
                >
                  {line}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div>
        <p className="mb-2 font-mono text-[10px] font-semibold tracking-widest uppercase">
          Test Cases — input: expressão de chamada, ex: twoSum([2,7,11,15], 9)
        </p>
        {testCases.map((tc, i) => (
          <div key={i}>
            <div className="mb-2 flex items-center gap-2">
              <input
                id={`playground-test-input-${i}`}
                aria-label={`Input do teste ${i + 1}`}
                placeholder="ex: twoSum([2,7,11,15], 9)"
                value={tc.input}
                onChange={(e) => updateTestCase(i, "input", e.target.value)}
                className="border-border box-border flex-2 rounded-lg border p-2.5 font-mono text-xs"
              />
              <span className="font-mono text-xs">→</span>
              <input
                id={`playground-test-expected-${i}`}
                aria-label={`Resultado esperado do teste ${i + 1}`}
                placeholder="ex: [0,1]"
                value={tc.expected}
                onChange={(e) => updateTestCase(i, "expected", e.target.value)}
                className="border-border box-border flex-1 rounded-lg border p-2.5 font-mono text-xs"
              />
              <Button variant="outline" size="lg" onClick={() => removeTestCase(i)}>
                ✕
              </Button>
            </div>
            {testResults[i] !== undefined && (
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md border px-2.5 py-1 font-mono text-xs whitespace-nowrap",
                    testResults[i].pass
                      ? "border-[#00E5A0]/20 bg-[#00E5A0]/10 text-[#00E5A0]"
                      : "border-[#FF6B9D]/20 bg-[#FF6B9D]/10 text-[#FF6B9D]",
                  )}
                >
                  {testResults[i].pass ? "✓ passou" : "✗ falhou"}
                </span>

                {!testResults[i].pass && (
                  <span className="font-mono text-[11px] text-[#555]">
                    obteve: {String(testResults[i].actual).slice(0, 80)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        <Button variant="secondary" size="xs" onClick={addTestCase}>
          + Adicionar test case
        </Button>
      </div>
    </>
  );
}
