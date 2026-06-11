import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { ReviewTodayScreen } from "@/components/features/reviews/review-today-screen";

export const metadata: Metadata = {
  title: "Revisar Hoje",
  description: "Fila de revisão priorizada para hoje.",
};

export default function RevisarPage() {
  return (
    <PageContainer>
      <ReviewTodayScreen />
    </PageContainer>
  );
}
