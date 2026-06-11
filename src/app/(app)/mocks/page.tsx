import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Mocks",
  description: "Simule entrevistas e avalie seu desempenho.",
};

export default function MocksPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Mock Interviews"
        description="Grave e avalie entrevistas simuladas de coding, system design e behavioral."
      />
      <ComingSoonState
        featureName="Mock Interviews"
        delivery={11}
        description="Os mocks incluirão rubrica de avaliação, framework STAR e templates de system design. Será implementado na Entrega 11."
      />
    </PageContainer>
  );
}
