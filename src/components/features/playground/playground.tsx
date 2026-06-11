"use client";

import { useState, useRef, useCallback } from "react";
import FrontEndDrills from "./front-end-drills";
import PlaygroundEditor from "./playground-editor";
import PlaygroundSaved from "./playground-saved";

const ERROR_TYPES = [
  "padrão errado",
  "edge case",
  "complexidade",
  "bug de implementação",
  "comunicação",
  "teste insuficiente",
];

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

export default function Playground() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("editor");
  const [code, setCode] = useState(DEFAULT_CODE);

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
      </div>

      {activeTab === "editor" && <PlaygroundEditor />}

      {activeTab === "saved" && <PlaygroundSaved />}

      {activeTab === "drills" && <FrontEndDrills />}
    </div>
  );
}
