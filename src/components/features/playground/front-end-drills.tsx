import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FRONTEND_DRILLS } from "@/lib/data/front-end-drills";

export default function FrontEndDrills() {
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
            <Badge className="bg-[#60A5FA]/15 text-[#60A5FA]">{drill.topic}</Badge>
            <Badge className="bg-[#FFB547]/15 text-[#FFB547]">{drill.difficulty}</Badge>
            <Badge className="bg-[#7C6FF7]/15 text-[#7C6FF7]">{drill.tests.length} teste</Badge>
          </div>
          <Button variant="secondary">Praticar drill</Button>
        </div>
      ))}
    </div>
  );
}
