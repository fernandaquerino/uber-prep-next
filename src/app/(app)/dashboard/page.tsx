import type { Metadata } from "next";
import { DashboardScreen } from "@/components/features/dashboard/dashboard-screen";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visão geral do seu progresso de preparação.",
};

export default function DashboardPage() {
  return <DashboardScreen />;
}
