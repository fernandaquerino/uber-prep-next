import { Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ComingSoonStateProps = {
  featureName: string;
  delivery: number;
  description?: string;
  className?: string;
};

export function ComingSoonState({
  featureName,
  delivery,
  description,
  className,
}: ComingSoonStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-20 text-center",
        className,
      )}
    >
      <Construction className="text-muted-foreground h-10 w-10" aria-hidden="true" />
      <div className="space-y-2">
        <p className="text-foreground text-base font-semibold">{featureName}</p>
        <p className="text-muted-foreground text-sm">
          {description ?? `Será implementado na Entrega ${delivery.toString().padStart(2, "0")}.`}
        </p>
      </div>
      <Badge variant="secondary" className="font-mono text-xs">
        Entrega {delivery.toString().padStart(2, "0")}
      </Badge>
    </div>
  );
}
