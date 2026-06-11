import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Recursos",
  description: "Materiais de estudo recomendados.",
};

export default function RecursosPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Recursos"
        description="Livros, plataformas, vídeos e artigos recomendados para a preparação."
      />
      <ComingSoonState
        featureName="Recursos"
        delivery={13}
        description="Os recursos serão contextualizados com base nos seus tópicos mais fracos. Será implementado na Entrega 13."
      />
    </PageContainer>
  );
}
