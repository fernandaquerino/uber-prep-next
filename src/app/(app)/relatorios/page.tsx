import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Relatórios",
  description: "Relatórios semanais de progresso.",
};

export default function RelatoriosPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Relatórios"
        description="Comparativo semanal de progresso com geração de relatório em markdown."
      />
      <ComingSoonState
        featureName="Relatórios Semanais"
        delivery={15}
        description="Os relatórios compararão progresso entre semanas e permitirão exportar em markdown. Será implementado na Entrega 15."
      />
    </PageContainer>
  );
}
