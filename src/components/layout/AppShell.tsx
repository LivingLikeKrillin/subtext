import type { ReactNode } from "react";
import type { MainPage, RuntimeStatus } from "../../types";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  activePage: MainPage;
  runtime: RuntimeStatus;
  onNavigate: (page: MainPage) => void;
  children: ReactNode;
}

export function AppShell({ activePage, runtime, onNavigate, children }: AppShellProps) {
  return (
    <div className="flex h-screen">
      <Sidebar activePage={activePage} runtime={runtime} onNavigate={onNavigate} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
