"use client";

import { useState, useCallback } from "react";
import { useChecklist, useChecklistActions } from "@/hooks/use-checklist";
import { buildChecklistSessionVM } from "@/lib/presentation/mocks/build-mock-view-model";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RotateCcw, Plus, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

export function ChecklistTab({ onRefresh }: { onRefresh: () => void }) {
  const { session, history, isLoading, error, refresh } = useChecklist();
  const {
    newSession,
    toggleItem,
    resetSession,
    isLoading: saving,
  } = useChecklistActions(() => {
    refresh();
    onRefresh();
  });

  const [showHistory, setShowHistory] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [newSessionConfirm, setNewSessionConfirm] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const vm = session ? buildChecklistSessionVM(session) : null;

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const handleToggle = useCallback(
    async (itemId: string, checked: boolean) => {
      if (!session) return;
      await toggleItem(session.id, itemId, checked);
    },
    [session, toggleItem],
  );

  if (isLoading) return <div className="text-muted-foreground p-4 text-sm">Carregando...</div>;
  if (error) return <div className="text-destructive p-4 text-sm">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Checklist de preparação para entrevista.</p>
          {history.length > 1 && (
            <button
              className="text-muted-foreground hover:text-foreground text-xs underline"
              onClick={() => setShowHistory((v) => !v)}
            >
              {showHistory
                ? "Ocultar histórico"
                : `Ver histórico (${history.length - 1} sessões anteriores)`}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {session && (
            <Button size="sm" variant="outline" onClick={() => setResetConfirm(true)}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reiniciar
            </Button>
          )}
          <Button size="sm" onClick={() => (session ? setNewSessionConfirm(true) : newSession())}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Nova sessão
          </Button>
        </div>
      </div>

      {!vm ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            Crie uma nova sessão para começar o checklist.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Progress value={vm.progressPercent} className="h-2 flex-1" />
            <span className="shrink-0 text-sm font-medium">
              {vm.completedCount}/{vm.totalCount}
            </span>
            {vm.isComplete && <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />}
          </div>

          {vm.groups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            const isGroupComplete = group.isComplete;

            return (
              <Card key={group.id} className={isGroupComplete ? "opacity-75" : ""}>
                <CardHeader className="px-4 pt-3 pb-0">
                  <button
                    className="flex w-full items-center justify-between text-left"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{group.label}</span>
                      {isGroupComplete && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        {group.completedCount}/{group.totalCount}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <ChevronDown className="text-muted-foreground h-4 w-4" />
                      )}
                    </div>
                  </button>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="px-4 pt-2 pb-3">
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-2">
                          <Checkbox
                            id={`${group.id}-${item.id}`}
                            checked={item.checked}
                            onCheckedChange={(v) => handleToggle(item.id, !!v)}
                            disabled={saving}
                          />
                          <label
                            htmlFor={`${group.id}-${item.id}`}
                            className={`cursor-pointer text-sm leading-tight ${item.checked ? "text-muted-foreground line-through" : ""}`}
                          >
                            {item.text}
                            {item.isCustom && (
                              <Badge variant="outline" className="ml-1 py-0 text-xs">
                                custom
                              </Badge>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {showHistory && history.length > 1 && (
        <div className="space-y-2">
          <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Histórico de sessões
          </div>
          {history.slice(1).map((s) => {
            const hvm = buildChecklistSessionVM(s);
            return (
              <Card key={s.id} className="opacity-60">
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="text-sm">
                      {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {hvm.completedCount}/{hvm.totalCount} itens concluídos
                    </div>
                  </div>
                  <Badge variant={hvm.isComplete ? "default" : "secondary"}>
                    {hvm.isComplete ? "Completo" : `${hvm.progressPercent}%`}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reiniciar checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os itens marcados serão desmarcados. O histórico desta sessão será mantido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (session) await resetSession(session.id);
                setResetConfirm(false);
              }}
            >
              Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={newSessionConfirm} onOpenChange={setNewSessionConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nova sessão de checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              A sessão atual será mantida no histórico e uma nova sessão vazia será criada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await newSession();
                setNewSessionConfirm(false);
              }}
            >
              Criar nova sessão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
