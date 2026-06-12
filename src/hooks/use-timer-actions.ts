"use client";

import { useTimer } from "./use-timer";

export function useTimerActions() {
  return useTimer().actions;
}
