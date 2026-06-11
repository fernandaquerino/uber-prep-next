import { getCategoryVisual } from "@/lib/presentation/category-visuals";
import { cn } from "@/lib/utils";

type CategoryBadgeProps = {
  category: string;
  className?: string;
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const visual = getCategoryVisual(category);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        visual.badge,
        className,
      )}
    >
      {visual.label}
    </span>
  );
}
