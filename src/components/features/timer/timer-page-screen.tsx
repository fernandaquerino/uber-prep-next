"use client";

import { PageContainer } from "@/components/layout/page-container";
import { TimerPanel } from "./timer-panel";

export function TimerPageScreen() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold tracking-tight">Timer</h1>
        <div className="rounded-xl border">
          <TimerPanel />
        </div>
      </div>
    </PageContainer>
  );
}
