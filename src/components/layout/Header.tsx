import { useTranslation } from "react-i18next";
import type { RuntimeStatus } from "../../types";
import { StatusBadge } from "../shared/StatusBadge";

interface HeaderProps {
  runtime: RuntimeStatus;
  onOpenSettings: () => void;
}

export function Header({ runtime, onOpenSettings }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between border-b border-border pb-4 mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-50">{t("app.title")}</h1>
        <div className="flex items-center gap-2">
          <StatusBadge label="Whisper" status={runtime.whisper} />
          <StatusBadge label="LLM" status={runtime.llm} />
        </div>
      </div>
      <button
        className="rounded-md p-2 text-slate-400 transition-colors hover:bg-surface hover:text-slate-200"
        onClick={onOpenSettings}
        aria-label={t("settings.title")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </header>
  );
}
