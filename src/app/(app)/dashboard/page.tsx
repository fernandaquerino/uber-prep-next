import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visão geral do seu progresso de preparação.",
};

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu progresso de preparação para entrevistas."
      />
      <ComingSoonState
        featureName="Dashboard"
        delivery={6}
        description="O dashboard mostrará métricas de progresso, readiness e próximas ações. Será implementado na Entrega 06."
      />
    </PageContainer>
  );
}
