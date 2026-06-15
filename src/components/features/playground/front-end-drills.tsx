import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FRONTEND_DRILLS } from "@/lib/data/front-end-drills";
import { Drill } from "./playground";

type FrontEndDrillsProps = {
  loadDrill: (drill: Drill) => void;
};

export default function FrontEndDrills({ loadDrill }: FrontEndDrillsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
      {FRONTEND_DRILLS.map((drill) => (
        <div
          key={drill.id}
          className="border-border bg-sidebar hover:border-brand-purple flex cursor-pointer flex-col justify-between gap-2.5 rounded-lg border p-4 transition-all transition-colors"
        >
          <p className="text-sm font-bold">{drill.title}</p>
          <p className="text-xs leading-[1.5]">{drill.prompt}</p>
          <div className="flex gap-2">
            <Badge className="bg-info/15 text-info">{drill.topic}</Badge>
            <Badge className="bg-warning/15 text-warning">{drill.difficulty}</Badge>
            <Badge className="bg-brand-purple/15 text-brand-purple">{drill.tests.length} teste</Badge>
          </div>
          <Button variant="secondary" onClick={() => loadDrill(drill)}>
            Praticar drill
          </Button>
        </div>
      ))}
    </div>
  );
}
