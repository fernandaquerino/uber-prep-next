"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3 } from "lucide-react";
import FrontEndDrills from "./front-end-drills";
import PlaygroundEditor from "./playground-editor";
import PlaygroundSaved from "./playground-saved";
import { getDb } from "@/lib/db/db";
import { createPlaygroundRepository } from "@/lib/repositories/playground.repository";
import type { PlaygroundSolutionRecord } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTimerActions } from "@/hooks/use-timer-actions";
import {
  createSolutionId,
  normalizeStoredTestCases,
  parseStoredSolutionNotes,
  serializeSolutionNotes,
} from "./playground-storage";

const DEFAULT_CODE = `// Escreva sua solução aqui
// Exemplo: Two Sum
function twoSum(nums, target) {
  const map = new Map()
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (map.has(complement)) return [map.get(complement), i]
    map.set(nums[i], i)
  }
  return []
}

console.log(twoSum([2, 7, 11, 15], 9))  // [0, 1]
`;

function createWorker() {
  return new Worker(new URL("../../../workers/runner.worker.ts", import.meta.url), {
    type: "module",
  });
}

type ActiveTab = "editor" | "saved" | "drills";

export type RunMode = "run" | "test";

export interface TestCase {
  input: string;
  expected: string;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  pass: boolean;
  isError: boolean;
}

type WorkerResponse = {
  logs: string[];
  testResults: TestResult[];
  error: string | null;
};

export type Drill = {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  prompt: string;
  starter: string;
  tests: {
    input: string;
    expected: string;
  }[];
  rubric: string[];
};

export type SaveMeta = {
  name: string;
  topic: string;
  status: string;
  errorType: string;
  timeComplexity: string;
  spaceComplexity: string;
  notes: string;
};

export default function Playground() {
  const timerActions = useTimerActions();
  const [activeTab, setActiveTab] = useState<ActiveTab>("editor");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([{ input: "", expected: "" }]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const [running, setRunning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savePanel, setSavePanel] = useState(false);
  const [saveMeta, setSaveMeta] = useState<SaveMeta>({
    name: "",
    topic: "",
    status: "draft",
    errorType: "",
    timeComplexity: "",
    spaceComplexity: "",
    notes: "",
  });

  function addTestCase() {
    setTestCases((prev) => [...prev, { input: "", expected: "" }]);
  }

  function removeTestCase(i: number) {
    setTestCases((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateTestCase(i: number, field: keyof TestCase, val: string) {
    setTestCases((prev) => prev.map((tc, idx) => (idx === i ? { ...tc, [field]: val } : tc)));
  }

  const clearRunTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const killWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const finishRun = useCallback(() => {
    clearRunTimeout();
    killWorker();

    if (mountedRef.current) {
      setRunning(false);
    }
  }, [clearRunTimeout, killWorker]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearRunTimeout();
      killWorker();
    };
  }, [clearRunTimeout, killWorker]);

  function loadDrill(drill: Drill) {
    setCode(drill.starter);
    setSaveMeta({
      name: drill.title,
      topic: drill.topic,
      status: "draft",
      errorType: "",
      timeComplexity: "",
      spaceComplexity: "",
      notes: `Prompt: ${drill.prompt}\nRubrica: ${drill.rubric.join("; ")}`,
    });
    setTestCases(drill.tests);
    setEditingId(null);
    setOutput([]);
    setTestResults([]);
    setSavePanel(true);
    setActiveTab("editor");
  }

  function loadSavedSolution(solution: PlaygroundSolutionRecord) {
    const notes = parseStoredSolutionNotes(solution.notes);

    setCode(solution.code ?? "");
    setSaveMeta({
      name: solution.title ?? "",
      topic: solution.category ?? "",
      status: notes.status ?? "draft",
      errorType: notes.errorType ?? "",
      timeComplexity: notes.timeComplexity ?? "",
      spaceComplexity: notes.spaceComplexity ?? "",
      notes: notes.notes ?? "",
    });
    setTestCases(normalizeStoredTestCases(notes.testCases));
    setEditingId(solution.id);
    setOutput(solution.output ? solution.output.split("\n") : []);
    setTestResults([]);
    setSavePanel(true);
    setActiveTab("editor");
  }

  function newSolution() {
    setCode(DEFAULT_CODE);
    setSaveMeta({
      name: "",
      topic: "",
      status: "draft",
      errorType: "",
      timeComplexity: "",
      spaceComplexity: "",
      notes: "",
    });
    setTestCases([{ input: "", expected: "" }]);
    setEditingId(null);
    setOutput([]);
    setTestResults([]);
    setSavePanel(false);
    setActiveTab("editor");
  }

  function startPlaygroundFocus() {
    const title = saveMeta.name.trim() || "Playground";

    void timerActions.start({
      mode: "countdown",
      sourceType: "playground_solution",
      sourceId: editingId ?? undefined,
      category: saveMeta.topic.trim() || "fe_coding",
      title: `Playground: ${title}`,
      targetDurationSeconds: 45 * 60,
    });
  }

  async function handleSave() {
    const title = saveMeta.name.trim();

    if (!title) {
      setOutput((prev) => [...prev, "[erro] Informe um nome para salvar a solução."]);
      return;
    }

    setSaving(true);

    try {
      const repository = createPlaygroundRepository(getDb());
      const id = editingId ?? createSolutionId();
      const now = new Date().toISOString();
      const existing = await repository.findById(id);
      const passRate =
        testResults.length > 0
          ? Math.round(
              (testResults.filter((result) => result.pass).length / testResults.length) * 100,
            )
          : null;
      const notes = serializeSolutionNotes({
        status: saveMeta.status,
        errorType: saveMeta.errorType || null,
        timeComplexity: saveMeta.timeComplexity || null,
        spaceComplexity: saveMeta.spaceComplexity || null,
        notes: saveMeta.notes,
        testCases,
        testPassRate: passRate,
        lastTestedAt: testResults.length > 0 ? now : null,
      });

      await repository.upsert({
        id,
        title,
        language: "javascript",
        code,
        output: output.join("\n"),
        notes,
        category: saveMeta.topic.trim() || undefined,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });

      setEditingId(id);
      setSavePanel(false);
      setOutput((prev) => [
        ...prev,
        `[salvo] ${editingId ? "Solução atualizada" : "Solução salva"}: ${title}`,
      ]);
    } catch (error) {
      setOutput((prev) => [
        ...prev,
        `[erro] Não foi possível salvar: ${error instanceof Error ? error.message : String(error)}`,
      ]);
    } finally {
      setSaving(false);
    }
  }

  const runCode = useCallback(
    (mode: RunMode) => {
      killWorker();
      clearRunTimeout();
      setRunning(true);
      if (mode === "run") {
        setOutput([]);
        setTestResults([]);
      } else {
        setTestResults([]);
      }

      const worker = createWorker();
      workerRef.current = worker;
      timeoutRef.current = setTimeout(() => {
        killWorker();
        timeoutRef.current = null;
        if (!mountedRef.current) return;

        setRunning(false);
        if (mode === "run") {
          setOutput((prev) => [
            ...prev,
            "[timeout] Execução encerrada após 5s — verifique loops infinitos",
          ]);
        } else {
          setTestResults([
            {
              input: "—",
              expected: "—",
              actual: "timeout: execução encerrada após 5s",
              pass: false,
              isError: true,
            },
          ]);
        }
      }, 5000);

      worker.onmessage = (e) => {
        finishRun();
        if (!mountedRef.current) return;

        const { logs, testResults: tr, error } = e.data as WorkerResponse;
        if (mode === "run") {
          const lines = [...logs];
          if (error) lines.push("[erro] " + error);
          setOutput(lines.length > 0 ? lines : ["(sem output)"]);
        } else {
          setTestResults(tr);
          if (error) setOutput((prev) => [...prev, "[erro] " + error]);
        }
      };

      worker.onerror = (e) => {
        finishRun();
        if (!mountedRef.current) return;

        setOutput((prev) => [...prev, "[erro] " + e.message]);
      };

      worker.postMessage({
        code,
        testCases: mode === "test" ? testCases : [],
        runMode: mode,
      });
    },
    [clearRunTimeout, code, finishRun, killWorker, testCases],
  );

  return (
    <div className="mt-4">
      <div
        className="mb-6 flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Playground"
      >
        <button
          id="playground-tab-editor"
          type="button"
          role="tab"
          aria-selected={activeTab === "editor"}
          aria-controls="playground-panel-editor"
          className={`cursor-pointer rounded-lg border px-3.5 py-1.5 font-[inherit] text-xs ${
            activeTab === "editor"
              ? "border-brand-purple bg-brand-purple/10 text-brand-purple font-semibold"
              : "border-border bg-transparent font-normal"
          } `}
          onClick={() => setActiveTab("editor")}
        >
          Editor
        </button>
        <button
          id="playground-tab-saved"
          type="button"
          role="tab"
          aria-selected={activeTab === "saved"}
          aria-controls="playground-panel-saved"
          className={`cursor-pointer rounded-lg border px-3.5 py-1.5 font-[inherit] text-xs ${
            activeTab === "saved"
              ? "border-brand-purple bg-brand-purple/10 text-brand-purple font-semibold"
              : "border-border bg-transparent font-normal"
          } `}
          onClick={() => setActiveTab("saved")}
        >
          Soluções salvas
        </button>
        <button
          id="playground-tab-drills"
          type="button"
          role="tab"
          aria-selected={activeTab === "drills"}
          aria-controls="playground-panel-drills"
          className={`cursor-pointer rounded-lg border px-3.5 py-1.5 font-[inherit] text-xs ${
            activeTab === "drills"
              ? "border-brand-purple bg-brand-purple/10 text-brand-purple font-semibold"
              : "border-border bg-transparent font-normal"
          } `}
          onClick={() => setActiveTab("drills")}
        >
          Frontend drills
        </button>
        <div className="flex-1" />
        {activeTab === "editor" && (
          <>
            <Button variant="outline" onClick={startPlaygroundFocus}>
              <Clock3 className="h-4 w-4" aria-hidden />
              Foco
            </Button>
            <Button variant="outline" onClick={newSolution}>
              Nova
            </Button>
            {editingId && <Badge>editando</Badge>}
          </>
        )}
      </div>

      <section
        id="playground-panel-editor"
        role="tabpanel"
        aria-labelledby="playground-tab-editor"
        hidden={activeTab !== "editor"}
      >
        {activeTab === "editor" && (
          <PlaygroundEditor
            code={code}
            setCode={setCode}
            output={output}
            testCases={testCases}
            addTestCase={addTestCase}
            removeTestCase={removeTestCase}
            updateTestCase={updateTestCase}
            testResults={testResults}
            running={running}
            runCode={runCode}
            savePanel={savePanel}
            setSavePanel={setSavePanel}
            saveMeta={saveMeta}
            setSaveMeta={setSaveMeta}
            editingId={editingId}
            saving={saving}
            onSave={handleSave}
          />
        )}
      </section>

      <section
        id="playground-panel-saved"
        role="tabpanel"
        aria-labelledby="playground-tab-saved"
        hidden={activeTab !== "saved"}
      >
        {activeTab === "saved" && <PlaygroundSaved onLoad={loadSavedSolution} />}
      </section>

      <section
        id="playground-panel-drills"
        role="tabpanel"
        aria-labelledby="playground-tab-drills"
        hidden={activeTab !== "drills"}
      >
        {activeTab === "drills" && <FrontEndDrills loadDrill={loadDrill} />}
      </section>
    </div>
  );
}
