import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Plano",
  description: "Plano de estudos de 6 semanas.",
};

export default function PlanoPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Plano de Estudos"
        description="Acompanhe seu plano de estudos de 6 semanas para a entrevista."
      />
      <ComingSoonState
        featureName="Plano de Estudos"
        delivery={5}
        description="O plano mostrará os 36 dias de estudo mapeados ao calendário real, com progresso por bloco. Será implementado na Entrega 05."
      />
    </PageContainer>
  );
}
