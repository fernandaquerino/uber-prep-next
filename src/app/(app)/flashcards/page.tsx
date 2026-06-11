import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Estude com flashcards de repetição espaçada.",
};

export default function FlashcardsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Flashcards"
        description="Crie e estude flashcards com repetição espaçada para fixar conceitos."
      />
      <ComingSoonState
        featureName="Flashcards"
        delivery={8}
        description="Os flashcards usarão repetição espaçada com ciclos de revisão de 1, 3, 7, 14 e 30 dias. Será implementado na Entrega 08."
      />
    </PageContainer>
  );
}
