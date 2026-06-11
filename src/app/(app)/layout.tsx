import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { LegacyMigrationCheck } from "@/features/backup/components/legacy-migration-check";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main id="main-content" className="flex-1 overflow-y-auto focus:outline-none" tabIndex={-1}>
          {children}
        </main>
      </div>
      <LegacyMigrationCheck />
    </div>
  );
}
