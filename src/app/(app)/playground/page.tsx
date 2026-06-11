import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/feedback/page-header";
import Playground from "@/components/features/playground/playground";

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
      <Playground />
    </PageContainer>
  );
}
