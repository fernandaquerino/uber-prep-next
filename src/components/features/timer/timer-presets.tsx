import { Button } from "@/components/ui/button";
import { TIMER_PRESETS_SECONDS } from "@/lib/domain/timer";

export function TimerPresets({
  value,
  onChange,
}: {
  value: number;
  onChange: (seconds: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Presets de duração">
      {TIMER_PRESETS_SECONDS.map((seconds) => (
        <Button
          key={seconds}
          type="button"
          variant={value === seconds ? "secondary" : "outline"}
          size="sm"
          onClick={() => onChange(seconds)}
        >
          {seconds / 60} min
        </Button>
      ))}
    </div>
  );
}
