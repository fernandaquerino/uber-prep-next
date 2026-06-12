"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  Repeat,
  Target,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatCalendarDateRelative } from "@/lib/utils/relative-date";
import { useNotifications } from "@/hooks/use-notifications";
import type { AppNotification, NotificationType } from "@/lib/domain/notifications";

const TYPE_VISUALS: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  plan_overdue: { icon: TriangleAlert, className: "bg-danger-subtle text-danger" },
  review_overdue: { icon: Repeat, className: "bg-warning-subtle text-warning" },
  review_due: { icon: Repeat, className: "bg-info-subtle text-info" },
  study_today: { icon: Target, className: "bg-primary-subtle text-primary" },
};

function NotificationItem({
  notification,
  today,
  unread,
  onNavigate,
}: {
  notification: AppNotification;
  today: string | null;
  unread: boolean;
  onNavigate: () => void;
}) {
  const visual = TYPE_VISUALS[notification.type];
  const Icon = visual.icon;

  return (
    <li className="border-border relative border-b last:border-b-0">
      <Link
        href={notification.href}
        onClick={onNavigate}
        className="hover:bg-surface-muted flex gap-3 px-5 py-4 transition-colors"
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            visual.className,
          )}
          aria-hidden
        >
          <Icon className="size-4.5" />
        </span>

        <div className="min-w-0 flex-1 pr-4">
          <p className="text-text-primary text-sm font-semibold">{notification.title}</p>
          <p className="text-muted-foreground mt-0.5 text-sm leading-5">
            {notification.description}
          </p>
          {today && (
            <p className="text-muted-foreground mt-1 text-xs">
              {formatCalendarDateRelative(notification.date, today)}
            </p>
          )}
        </div>

        {unread && (
          <span
            className="bg-primary absolute top-5 right-5 size-2 rounded-full"
            aria-label="Não lida"
          />
        )}
      </Link>
    </li>
  );
}

export function NotificationsPanel() {
  const { notifications, today, status } = useNotifications();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(new Set());

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)).length,
    [notifications, readIds],
  );

  function markAllAsRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={
              unreadCount > 0 ? `Notificações, ${unreadCount} não lidas` : "Notificações"
            }
          />
        }
      >
        <Bell className="size-5" aria-hidden />
        {unreadCount > 0 && (
          <span
            className="bg-danger ring-surface absolute top-1.5 right-1.5 size-2 rounded-full ring-2"
            aria-hidden
          />
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden p-0"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <h2 className="text-text-primary font-heading text-base font-bold">Notificações</h2>
          {unreadCount > 0 && (
            <span className="bg-primary-subtle text-primary rounded-md px-2 py-0.5 text-xs font-medium">
              {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
            </span>
          )}
          <Button
            variant="link"
            size="sm"
            className="ml-auto h-auto px-0"
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
          >
            Marcar lidas
          </Button>
        </div>

        <Separator />

        {status === "ready" && notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
            <BellOff className="text-muted-foreground size-6" aria-hidden />
            <p className="text-text-primary text-sm font-medium">Tudo em dia</p>
            <p className="text-muted-foreground text-xs">
              Sem revisões vencidas ou conteúdos atrasados.
            </p>
          </div>
        ) : status === "loading" ? (
          <p className="text-muted-foreground px-5 py-10 text-center text-sm">Carregando…</p>
        ) : status === "error" ? (
          <p className="text-destructive px-5 py-10 text-center text-sm">
            Não foi possível carregar as notificações.
          </p>
        ) : (
          <ul className="max-h-[28rem] overflow-y-auto" aria-label="Notificações">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                today={today}
                unread={!readIds.has(notification.id)}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
