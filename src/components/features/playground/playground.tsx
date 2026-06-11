"use client";

import { useCallback, useRef, useState } from "react";
import FrontEndDrills from "./front-end-drills";
import PlaygroundEditor from "./playground-editor";
import PlaygroundSaved from "./playground-saved";
import { getDb } from "@/lib/db/db";
import { createPlaygroundRepository } from "@/lib/repositories/playground.repository";
import type { PlaygroundSolutionRecord } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

type StoredSolutionNotes = Partial<
  Pick<SaveMeta, "status" | "errorType" | "timeComplexity" | "spaceComplexity" | "notes">
> & {
  testCases?: TestCase[];
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
  const [activeTab, setActiveTab] = useState<ActiveTab>("editor");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([{ input: "", expected: "" }]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const workerRef = useRef<Worker | null>(null);
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

  function killWorker() {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }

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
      const notes = JSON.stringify(
        {
          status: saveMeta.status,
          errorType: saveMeta.errorType || null,
          timeComplexity: saveMeta.timeComplexity || null,
          spaceComplexity: saveMeta.spaceComplexity || null,
          notes: saveMeta.notes,
          testCases,
          testPassRate: passRate,
          lastTestedAt: testResults.length > 0 ? now : null,
        },
        null,
        2,
      );

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

  function createSolutionId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `playground:${crypto.randomUUID()}`;
    }

    return `playground:${Date.now()}`;
  }

  const runCode = useCallback(
    (mode: RunMode) => {
      killWorker();
      setRunning(true);
      if (mode === "run") {
        setOutput([]);
        setTestResults([]);
      } else {
        setTestResults([]);
      }

      const worker = createWorker();
      workerRef.current = worker;
      const timeout = setTimeout(() => {
        killWorker();
        setRunning(false);
        if (mode === "run")
          setOutput((prev) => [
            ...prev,
            "[timeout] Execução encerrada após 5s — verifique loops infinitos",
          ]);
        else
          setTestResults([
            {
              input: "—",
              expected: "—",
              actual: "timeout: execução encerrada após 5s",
              pass: false,
              isError: true,
            },
          ]);
      }, 5000);

      worker.onmessage = (e) => {
        clearTimeout(timeout);
        killWorker();
        setRunning(false);
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
        clearTimeout(timeout);
        killWorker();
        setRunning(false);
        setOutput((prev) => [...prev, "[erro] " + e.message]);
      };

      worker.postMessage({
        code,
        testCases: mode === "test" ? testCases : [],
        runMode: mode,
      });
    },
    [code, testCases],
  );

  return (
    <div className="mt-4">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
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
            <Button variant="outline" onClick={newSolution}>
              Nova
            </Button>
            {editingId && <Badge>editando</Badge>}
          </>
        )}
      </div>

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

      {activeTab === "saved" && <PlaygroundSaved onLoad={loadSavedSolution} />}

      {activeTab === "drills" && <FrontEndDrills loadDrill={loadDrill} />}
    </div>
  );
}

function parseStoredSolutionNotes(notes: string | undefined): StoredSolutionNotes {
  if (!notes) return {};

  try {
    const parsed = JSON.parse(notes) as unknown;
    return typeof parsed === "object" && parsed !== null ? (parsed as StoredSolutionNotes) : {};
  } catch {
    return { notes };
  }
}

function normalizeStoredTestCases(testCases: unknown): TestCase[] {
  if (!Array.isArray(testCases)) return [{ input: "", expected: "" }];

  const normalized = testCases
    .filter((item): item is Partial<TestCase> => typeof item === "object" && item !== null)
    .map((item) => ({
      input: typeof item.input === "string" ? item.input : "",
      expected: typeof item.expected === "string" ? item.expected : "",
    }));

  return normalized.length > 0 ? normalized : [{ input: "", expected: "" }];
}
