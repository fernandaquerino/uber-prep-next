import type { Metadata } from "next";
import { ReportsScreen } from "@/components/features/reports/reports-screen";

export const metadata: Metadata = {
  title: "Relatórios",
  description: "Relatórios semanais de progresso.",
};

export default function RelatoriosPage() {
  return <ReportsScreen />;
}
