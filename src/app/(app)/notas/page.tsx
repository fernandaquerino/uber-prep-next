import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Notas",
  description: "Anotações de estudo por tópico.",
};

export default function NotasPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Notas"
        description="Escreva e organize anotações de estudo em markdown por tópico."
      />
      <ComingSoonState
        featureName="Notas"
        delivery={13}
        description="As notas suportarão markdown, busca e organização por área de estudo. Será implementado na Entrega 13."
      />
    </PageContainer>
  );
}
