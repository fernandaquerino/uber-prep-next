import type { Metadata } from "next";
import { StatisticsScreen } from "@/components/features/statistics/statistics-screen";

export const metadata: Metadata = {
  title: "Estatísticas",
  description: "Estatísticas detalhadas da sua preparação.",
};

export default function EstatisticasPage() {
  return <StatisticsScreen />;
}
