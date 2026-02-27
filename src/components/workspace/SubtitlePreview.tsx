import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { SttSegment, TranslateSegment } from "../../types";

interface SubtitlePreviewProps {
  sttSegments: SttSegment[];
  translateSegments: TranslateSegment[];
  activeIndex: number | null;
}

function formatTimestamp(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const ms = Math.round((secs % 1) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

export function SubtitlePreview({
  sttSegments,
  translateSegments,
  activeIndex,
}: SubtitlePreviewProps) {
  const { t } = useTranslation();
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex]);

  if (sttSegments.length === 0) {
    return (
      <div className="mb-4 rounded-xl bg-surface p-6 text-center text-sm text-slate-500">
        {t("workspace.preview.noSegments")}
      </div>
    );
  }

  const translateMap = new Map(
    translateSegments.map((s) => [s.index, s.translated]),
  );

  return (
    <div className="mb-4 max-h-[300px] overflow-y-auto rounded-xl bg-surface">
      {/* Header */}
      <div className="sticky top-0 grid grid-cols-[100px_1fr_1fr] gap-2 border-b border-border bg-surface px-4 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        <span>{t("workspace.preview.timestamp")}</span>
        <span>{t("workspace.preview.original")}</span>
        <span>{t("workspace.preview.translated")}</span>
      </div>

      {/* Rows */}
      {sttSegments.map((seg) => {
        const isActive = seg.index === activeIndex;
        return (
          <div
            key={seg.index}
            ref={isActive ? activeRef : undefined}
            className={`grid grid-cols-[100px_1fr_1fr] gap-2 border-b border-border/50 px-4 py-2 text-sm transition-colors ${
              isActive ? "bg-primary/10" : ""
            }`}
          >
            <span className="text-xs text-slate-500">
              {formatTimestamp(seg.start)}
            </span>
            <span className="text-slate-300">{seg.text}</span>
            <span className="text-slate-400">
              {translateMap.get(seg.index) ?? ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
