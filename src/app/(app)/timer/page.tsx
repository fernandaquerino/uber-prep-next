import type { Metadata } from "next";
import { TimerPageScreen } from "@/components/features/timer/timer-page-screen";

export const metadata: Metadata = {
  title: "Timer",
  description: "Timer global e sessões de foco.",
};

export default function TimerPage() {
  return <TimerPageScreen />;
}
