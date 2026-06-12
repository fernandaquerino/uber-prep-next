import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { QuizzesScreen } from "@/components/features/quizzes/quizzes-screen";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Pratique com questões de múltipla escolha e abertas.",
};

export default function QuizzesPage() {
  return (
    <PageContainer>
      <QuizzesScreen />
    </PageContainer>
  );
}
