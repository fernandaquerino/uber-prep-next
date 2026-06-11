import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import { ComingSoonState } from "@/components/feedback/coming-soon-state";

export const metadata: Metadata = {
  title: "Playground",
  description: "Editor de código com execução e testes automáticos.",
};

export default function PlaygroundPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Playground"
        description="Escreva e teste soluções de código com feedback imediato."
      />
      <ComingSoonState
        featureName="Playground"
        delivery={12}
        description="O playground incluirá editor Monaco, execução isolada via Web Worker e test runner. Será implementado na Entrega 12."
      />
    </PageContainer>
  );
}
