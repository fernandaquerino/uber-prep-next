import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Pratique com questões de múltipla escolha e abertas.",
};

export default function QuizzesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Quizzes"
        description="Pratique com questões de algoritmos, frontend e system design."
      />
      <ComingSoonState
        featureName="Quizzes"
        delivery={9}
        description="Os quizzes incluirão questões de múltipla escolha, abertas e daily quiz gerado automaticamente. Será implementado na Entrega 09."
      />
    </PageContainer>
  );
}
