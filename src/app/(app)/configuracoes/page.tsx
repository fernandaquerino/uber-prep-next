import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { SettingsScreen } from "@/components/features/settings/settings-screen";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Configurações do aplicativo.",
};

export default function ConfiguracoesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Configurações"
        description="Gerencie plano, agenda, revisões, timer, aparência e dados."
      />
      <SettingsScreen />
    </PageContainer>
  );
}
