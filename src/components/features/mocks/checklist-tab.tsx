"use client";

import { useState, useCallback } from "react";
import { useChecklist, useChecklistActions } from "@/hooks/use-checklist";
import { buildChecklistSessionVM } from "@/lib/presentation/mocks/build-mock-view-model";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RotateCcw, Plus, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

export function ChecklistTab({ onRefresh }: { onRefresh: () => void }) {
  const { session, history, isLoading, error, refresh } = useChecklist();
  const { newSession, toggleItem, resetSession, isLoading: saving } =
    useChecklistActions(() => { refresh(); onRefresh(); });

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

  const handleToggle = useCallback(async (itemId: string, checked: boolean) => {
    if (!session) return;
    await toggleItem(session.id, itemId, checked);
  }, [session, toggleItem]);

  if (isLoading) return <div className="text-sm text-muted-foreground p-4">Carregando...</div>;
  if (error) return <div className="text-sm text-destructive p-4">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Checklist de preparação para entrevista.
          </p>
          {history.length > 1 && (
            <button
              className="text-xs underline text-muted-foreground hover:text-foreground"
              onClick={() => setShowHistory((v) => !v)}
            >
              {showHistory ? "Ocultar histórico" : `Ver histórico (${history.length - 1} sessões anteriores)`}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {session && (
            <Button size="sm" variant="outline" onClick={() => setResetConfirm(true)}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reiniciar
            </Button>
          )}
          <Button size="sm" onClick={() => (session ? setNewSessionConfirm(true) : newSession())}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nova sessão
          </Button>
        </div>
      </div>

      {!vm ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            Crie uma nova sessão para começar o checklist.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Progress value={vm.progressPercent} className="flex-1 h-2" />
            <span className="text-sm font-medium shrink-0">
              {vm.completedCount}/{vm.totalCount}
            </span>
            {vm.isComplete && (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            )}
          </div>

          {vm.groups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            const isGroupComplete = group.isComplete;

            return (
              <Card key={group.id} className={isGroupComplete ? "opacity-75" : ""}>
                <CardHeader className="pb-0 pt-3 px-4">
                  <button
                    className="flex items-center justify-between w-full text-left"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{group.label}</span>
                      {isGroupComplete && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {group.completedCount}/{group.totalCount}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-2 pb-3 px-4">
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
                            className={`text-sm cursor-pointer leading-tight ${item.checked ? "line-through text-muted-foreground" : ""}`}
                          >
                            {item.text}
                            {item.isCustom && (
                              <Badge variant="outline" className="ml-1 text-xs py-0">custom</Badge>
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
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Histórico de sessões
          </div>
          {history.slice(1).map((s) => {
            const hvm = buildChecklistSessionVM(s);
            return (
              <Card key={s.id} className="opacity-60">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm">
                      {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="text-xs text-muted-foreground">
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
            <AlertDialogAction onClick={async () => { if (session) await resetSession(session.id); setResetConfirm(false); }}>
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
            <AlertDialogAction onClick={async () => { await newSession(); setNewSessionConfirm(false); }}>
              Criar nova sessão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
