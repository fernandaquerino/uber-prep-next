import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Revisar Hoje",
  description: "Fila de revisão priorizada para hoje.",
};

export default function RevisarPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Revisar Hoje"
        description="Fila de revisão diária priorizada por retenção, erros e tempo desde a última revisão."
      />
      <ComingSoonState
        featureName="Revisão Hoje"
        delivery={7}
        description="A fila de revisão reunirá blocos do plano, flashcards e quizzes vencidos em uma sessão estruturada. Será implementada na Entrega 07."
      />
    </PageContainer>
  );
}
