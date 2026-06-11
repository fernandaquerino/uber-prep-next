import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Configurações do aplicativo.",
};

export default function ConfiguracoesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Configurações"
        description="Configurações de tema, exportação de dados e preferências do aplicativo."
      />
      <ComingSoonState
        featureName="Configurações"
        delivery={16}
        description="As configurações incluirão tema, exportação/importação de dados e preferências de notificação. Será implementado na Entrega 16."
      />
    </PageContainer>
  );
}
