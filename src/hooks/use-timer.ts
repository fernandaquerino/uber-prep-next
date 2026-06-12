"use client";

import { useContext } from "react";
import { TimerContext } from "@/components/features/timer/global-timer-provider";

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used inside GlobalTimerProvider.");
  }
  return context;
}
