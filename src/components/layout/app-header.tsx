import { ThemeToggle } from "./theme-toggle";
// import { MobileNavigation } from "./mobile-navigation";
import { TimerCompact } from "@/components/features/timer/timer-compact";

export function AppHeader() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex h-14 items-center border-b px-4 backdrop-blur">
      <div className="flex flex-1 items-center gap-2">
        {/* <MobileNavigation /> */}

        {/* Logo — visível apenas no mobile, pois sidebar tem logo no desktop */}
        <span className="font-mono text-sm font-bold lg:hidden">UBER_PREP</span>
      </div>

      <div className="flex items-center gap-1">
        <TimerCompact />
        <ThemeToggle />
      </div>
    </header>
  );
}
