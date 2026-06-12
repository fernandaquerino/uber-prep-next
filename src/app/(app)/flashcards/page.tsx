import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import FlashCards from "@/components/features/flashcards/flashcards";

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
      <FlashCards />
    </PageContainer>
  );
}
