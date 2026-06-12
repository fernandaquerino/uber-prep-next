"use client";

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { useSettings } from "@/hooks/use-settings";
import { useSettingsActions } from "@/hooks/use-settings-actions";
import { GeneralTab } from "./general-tab";
import { PlanTab } from "./plan-tab";
import { AgendaTab } from "./agenda-tab";
import { ReviewsTab } from "./reviews-tab";
import { TimerTab } from "./timer-tab";
import { AppearanceTab } from "./appearance-tab";
import { DataBackupTab } from "./data-backup-tab";
import { AccessibilityTab } from "./accessibility-tab";
import { PrivacyTab } from "./privacy-tab";
import { AdvancedTab } from "./advanced-tab";

const TABS = [
  { value: "geral", label: "Geral" },
  { value: "plano", label: "Plano" },
  { value: "agenda", label: "Agenda" },
  { value: "revisoes", label: "Revisões" },
  { value: "timer", label: "Timer" },
  { value: "aparencia", label: "Aparência" },
  { value: "dados", label: "Dados e Backup" },
  { value: "acessibilidade", label: "Acessibilidade" },
  { value: "privacidade", label: "Privacidade" },
  { value: "avancado", label: "Avançado" },
] as const;

export function SettingsScreen() {
  const { data, isLoading, error, refresh } = useSettings();
  const actions = useSettingsActions(refresh);

  if (isLoading) return <LoadingState label="Carregando configurações..." />;
  if (error) return <ErrorState description={error} onRetry={refresh} />;
  if (!data) return null;

  const { settings, timerSettings } = data;

  return (
    <Tabs defaultValue="geral">
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <TabsList className="flex w-max gap-0.5 h-auto p-1 flex-wrap">
          {TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value} className="text-xs sm:text-sm px-3 py-1.5">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="geral" className="mt-6">
        <GeneralTab settings={settings} onUpdate={actions.updateSettings} />
      </TabsContent>

      <TabsContent value="plano" className="mt-6">
        <PlanTab settings={settings} onUpdate={actions.updateSettings} />
      </TabsContent>

      <TabsContent value="agenda" className="mt-6">
        <AgendaTab settings={settings} onUpdate={actions.updateSettings} />
      </TabsContent>

      <TabsContent value="revisoes" className="mt-6">
        <ReviewsTab settings={settings} onUpdate={actions.updateSettings} />
      </TabsContent>

      <TabsContent value="timer" className="mt-6">
        <TimerTab timerSettings={timerSettings} onUpdate={actions.updateTimerSettings} />
      </TabsContent>

      <TabsContent value="aparencia" className="mt-6">
        <AppearanceTab settings={settings} onUpdate={actions.updateSettings} />
      </TabsContent>

      <TabsContent value="dados" className="mt-6">
        <DataBackupTab onResetModule={actions.resetModule} />
      </TabsContent>

      <TabsContent value="acessibilidade" className="mt-6">
        <AccessibilityTab settings={settings} onUpdate={actions.updateSettings} />
      </TabsContent>

      <TabsContent value="privacidade" className="mt-6">
        <PrivacyTab />
      </TabsContent>

      <TabsContent value="avancado" className="mt-6">
        <Suspense fallback={<LoadingState label="Carregando diagnóstico..." />}>
          <AdvancedTab />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
