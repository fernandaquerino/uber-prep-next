"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { useResources } from "@/hooks/use-resources";
import { useResourceActions } from "@/hooks/use-resource-actions";
import { filterResources, sortResources } from "@/lib/domain/resources";
import type { ResourceFilters, ResourceSortKey } from "@/lib/domain/resources";
import { ResourceCard } from "./resource-card";
import { ResourceFiltersBar } from "./resource-filters-bar";
import { ResourceFormDialog } from "./resource-form-dialog";
import { TechnicalEnglishTab } from "./technical-english-tab";
import type { ResourceStatus } from "@/types/database";

export function ResourcesScreen() {
  const { data, isLoading, error, refresh } = useResources();
  const actions = useResourceActions(refresh);

  const [filters, setFilters] = useState<ResourceFilters>({ lifecycleStatus: "active" });
  const [sortKey, setSortKey] = useState<ResourceSortKey>("recent");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("recursos");

  const filtered = useMemo(() => {
    if (!data) return [];
    return sortResources(filterResources(data.items, filters), sortKey);
  }, [data, filters, sortKey]);

  if (isLoading) return <LoadingState label="Carregando recursos..." />;
  if (error) return <ErrorState description={error} onRetry={refresh} />;
  if (!data) return null;

  const stats = data.stats;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Recursos & Inglês Técnico</h1>
          <p className="text-muted-foreground text-sm">
            {stats.total} recursos · {stats.inProgress} em andamento · {stats.completed} concluídos
          </p>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setShowForm(true)}>
          <Plus className="size-4" />
          Novo recurso
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="ingles">Inglês Técnico</TabsTrigger>
          <TabsTrigger value="favoritos">
            Favoritos
            {stats.favorites > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {stats.favorites}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recursos" className="mt-4 space-y-4">
          <ResourceFiltersBar
            filters={filters}
            sortKey={sortKey}
            allCategories={data.allCategories}
            allTags={data.allTags}
            onFiltersChange={setFilters}
            onSortChange={setSortKey}
          />

          {filtered.length === 0 ? (
            <EmptyState
              title="Nenhum recurso encontrado"
              description="Tente ajustar os filtros ou adicione um novo recurso."
              action={
                <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                  Adicionar recurso
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((item) => (
                <ResourceCard
                  key={item.resource.id}
                  item={item}
                  onToggleFavorite={actions.toggleFavorite}
                  onUpdateStatus={async (id, status: ResourceStatus) => {
                    await actions.updateStatus(id, status);
                    if (status === "completed") toast.success("Recurso marcado como concluído!");
                  }}
                  onOpenResource={actions.openResource}
                  onArchive={async (id) => {
                    await actions.archiveResource(id);
                    toast.success("Recurso arquivado.");
                  }}
                  onDelete={async (id) => {
                    await actions.deleteResource(id);
                    toast.success("Recurso excluído.");
                  }}
                  onMarkForReview={async (id) => {
                    await actions.markForReview(id);
                    toast.success("Adicionado à fila de revisão.");
                  }}
                  onEdit={() => {
                    // edit opens pre-filled form — simplified for this delivery
                    toast.info("Edição em breve.");
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ingles" className="mt-4">
          <TechnicalEnglishTab />
        </TabsContent>

        <TabsContent value="favoritos" className="mt-4 space-y-4">
          {(() => {
            const favFilters: ResourceFilters = { lifecycleStatus: "active", isFavorite: true };
            const favItems = sortResources(filterResources(data.items, favFilters), sortKey);
            if (favItems.length === 0) {
              return (
                <EmptyState
                  title="Nenhum favorito"
                  description="Favorite os recursos mais importantes clicando na estrela."
                />
              );
            }
            return (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {favItems.map((item) => (
                  <ResourceCard
                    key={item.resource.id}
                    item={item}
                    onToggleFavorite={actions.toggleFavorite}
                    onUpdateStatus={actions.updateStatus}
                    onOpenResource={actions.openResource}
                    onArchive={async (id) => {
                      await actions.archiveResource(id);
                      toast.success("Recurso arquivado.");
                    }}
                    onDelete={async (id) => {
                      await actions.deleteResource(id);
                      toast.success("Recurso excluído.");
                    }}
                    onMarkForReview={async (id) => {
                      await actions.markForReview(id);
                      toast.success("Adicionado à fila de revisão.");
                    }}
                    onEdit={() => toast.info("Edição em breve.")}
                  />
                ))}
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>

      <ResourceFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={async (data) => {
          await actions.createResource(data);
          toast.success("Recurso adicionado!");
        }}
      />
    </div>
  );
}
