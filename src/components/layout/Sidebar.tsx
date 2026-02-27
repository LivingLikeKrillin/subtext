import { useTranslation } from "react-i18next";
import { Subtitles, HardDrive, Settings } from "lucide-react";
import type { MainPage, RuntimeStatus } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";

interface SidebarProps {
  activePage: MainPage;
  runtime: RuntimeStatus;
  onNavigate: (page: MainPage) => void;
}

const NAV_ITEMS: { page: MainPage; icon: typeof Subtitles; section: "main" | "bottom" }[] = [
  { page: "workspace", icon: Subtitles, section: "main" },
  { page: "models", icon: HardDrive, section: "main" },
  { page: "settings", icon: Settings, section: "bottom" },
];

export function Sidebar({ activePage, runtime, onNavigate }: SidebarProps) {
  const { t } = useTranslation();

  const mainItems = NAV_ITEMS.filter((i) => i.section === "main");
  const bottomItems = NAV_ITEMS.filter((i) => i.section === "bottom");

  return (
    <aside className="flex h-screen w-[220px] flex-shrink-0 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          S
        </div>
        <span className="text-[15px] font-semibold text-slate-50">SubText</span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col px-3">
        <div className="flex flex-col gap-0.5">
          {mainItems.map(({ page, icon: Icon }) => {
            const active = activePage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "border-l-2 border-primary bg-surface-hover text-white"
                    : "border-l-2 border-transparent text-slate-400 hover:bg-surface-hover/50 hover:text-slate-200"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                {t(`nav.${page}`)}
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom section */}
        <div className="flex flex-col gap-0.5">
          <div className="mb-2 border-t border-border-subtle" />
          {bottomItems.map(({ page, icon: Icon }) => {
            const active = activePage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "border-l-2 border-primary bg-surface-hover text-white"
                    : "border-l-2 border-transparent text-slate-400 hover:bg-surface-hover/50 hover:text-slate-200"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                {t(`nav.${page}`)}
              </button>
            );
          })}
        </div>

        {/* Runtime badges */}
        <div className="flex flex-col gap-1.5 px-1 py-4">
          <StatusBadge label="Whisper" status={runtime.whisper} />
          <StatusBadge label="LLM" status={runtime.llm} />
        </div>
      </nav>
    </aside>
  );
}
