import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PlanScreen } from "@/components/features/plan/plan-screen";

export const metadata: Metadata = {
  title: "Plano de Estudos",
  description: "Acompanhe sua agenda, pendências e progresso de 6 semanas.",
};

export default function PlanoPage() {
  return (
    <PageContainer>
      <PlanScreen />
    </PageContainer>
  );
}
