import type { ReactNode } from "react";
import type { RuntimeStatus } from "../../types";
import { Header } from "./Header";

interface AppShellProps {
  runtime: RuntimeStatus;
  onOpenSettings: () => void;
  children: ReactNode;
}

export function AppShell({ runtime, onOpenSettings, children }: AppShellProps) {
  return (
    <div className="mx-auto max-w-[1000px] p-6">
      <Header runtime={runtime} onOpenSettings={onOpenSettings} />
      {children}
    </div>
  );
}
