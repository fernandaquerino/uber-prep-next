"use client";

import { MoreHorizontalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { BlockActionDef } from "@/lib/presentation/plan-view-models";

type BlockActionsMenuProps = {
  actions: BlockActionDef[];
  onAction: (id: string) => void;
  label?: string;
};

export function BlockActionsMenu({
  actions,
  onAction,
  label = "Mais ações",
}: BlockActionsMenuProps) {
  if (actions.length === 0) return null;

  const destructiveActions = actions.filter((a) => a.kind === "destructive");
  const normalActions = actions.filter((a) => a.kind !== "destructive");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:bg-muted focus-visible:ring-ring inline-flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
        aria-label={label}
      >
        <MoreHorizontalIcon className="h-4 w-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {normalActions.map((action) => (
          <DropdownMenuItem key={action.id} onClick={() => onAction(action.id)}>
            {action.label}
          </DropdownMenuItem>
        ))}
        {destructiveActions.length > 0 && normalActions.length > 0 && <DropdownMenuSeparator />}
        {destructiveActions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            variant="destructive"
            onClick={() => onAction(action.id)}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
