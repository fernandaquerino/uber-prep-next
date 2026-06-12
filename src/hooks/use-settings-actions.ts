"use client";

import { useCallback } from "react";
import type { UpdateSettingsInput, TimerSettingsInput } from "@/lib/domain/settings";
import type { ResetModule } from "@/lib/application/settings";

export type UseSettingsActionsResult = {
  updateSettings: (input: UpdateSettingsInput) => Promise<void>;
  updateTimerSettings: (input: Partial<TimerSettingsInput>) => Promise<void>;
  resetModule: (module: ResetModule, confirmText?: string) => Promise<void>;
};

export function useSettingsActions(refresh: () => void): UseSettingsActionsResult {
  const updateSettings = useCallback(
    async (input: UpdateSettingsInput) => {
      const { getDb } = await import("@/lib/db/db");
      const { updateSettings: update } = await import("@/lib/application/settings");
      await update(getDb(), input);
      refresh();
    },
    [refresh],
  );

  const updateTimerSettings = useCallback(
    async (input: Partial<TimerSettingsInput>) => {
      const { getDb } = await import("@/lib/db/db");
      const { updateTimerSettings: update } = await import("@/lib/application/settings");
      await update(getDb(), input);
      refresh();
    },
    [refresh],
  );

  const resetModule = useCallback(
    async (module: ResetModule, confirmText?: string) => {
      if (module === "all" && confirmText !== "RESETAR") {
        throw new Error("Digite RESETAR para confirmar o reset total.");
      }
      const { getDb } = await import("@/lib/db/db");
      const { resetModule: reset } = await import("@/lib/application/settings");
      await reset(getDb(), module);
      refresh();
    },
    [refresh],
  );

  return { updateSettings, updateTimerSettings, resetModule };
}
