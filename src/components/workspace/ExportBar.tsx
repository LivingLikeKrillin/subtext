import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Download, FolderOpen, Check, Loader2 } from "lucide-react";
import type { SttSegment, TranslateSegment } from "../../types";
import { exportSubtitles, openFolder, type ExportSegmentInput } from "../../lib/tauriApi";

const FORMATS = ["srt", "vtt", "ass", "txt"] as const;

interface ExportBarProps {
  sttSegments: SttSegment[];
  translateSegments: TranslateSegment[];
  defaultFormat: string;
  defaultOutputDir: string;
  sourceFileName: string;
}

export function ExportBar({
  sttSegments,
  translateSegments,
  defaultFormat,
  defaultOutputDir,
  sourceFileName,
}: ExportBarProps) {
  const { t } = useTranslation();
  const [format, setFormat] = useState(
    FORMATS.includes(defaultFormat as (typeof FORMATS)[number])
      ? defaultFormat
      : "srt",
  );
  const [exporting, setExporting] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    if (sttSegments.length === 0) return;

    setExporting(true);
    setError(null);
    setSavedPath(null);

    try {
      // Merge STT + translate segments into ExportSegmentInput[]
      const translateMap = new Map(
        translateSegments.map((ts) => [ts.index, ts.translated]),
      );

      const segments: ExportSegmentInput[] = sttSegments.map((seg) => ({
        index: seg.index,
        start: seg.start,
        end: seg.end,
        text: seg.text,
        translated: translateMap.get(seg.index),
      }));

      const path = await exportSubtitles(
        segments,
        format,
        defaultOutputDir,
        sourceFileName,
      );
      setSavedPath(path);
    } catch (e) {
      setError(String(e));
    } finally {
      setExporting(false);
    }
  }, [sttSegments, translateSegments, format, defaultOutputDir, sourceFileName]);

  const handleOpenFolder = useCallback(() => {
    if (savedPath) {
      openFolder(savedPath);
    }
  }, [savedPath]);

  if (sttSegments.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl bg-surface p-4">
      <div className="flex items-center gap-3">
        {/* Format selector */}
        <label className="flex items-center gap-2 text-sm text-slate-400">
          {t("workspace.export.format")}
          <select
            value={format}
            onChange={(e) => {
              setFormat(e.target.value);
              setSavedPath(null);
            }}
            className="rounded-lg border border-slate-600 bg-surface-inset px-2 py-1 text-sm text-slate-200 outline-none focus:border-primary"
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          {exporting
            ? t("workspace.export.exporting")
            : t("workspace.export.button")}
        </button>

        {/* Success: saved path + open folder */}
        {savedPath && (
          <div className="flex min-w-0 items-center gap-2 text-sm text-success">
            <Check size={14} className="shrink-0" />
            <span className="truncate">
              {t("workspace.export.saved")}: {savedPath}
            </span>
            <button
              onClick={handleOpenFolder}
              className="flex shrink-0 cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-surface-inset hover:text-slate-200"
            >
              <FolderOpen size={12} />
              {t("workspace.export.openFolder")}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <span className="text-sm text-danger">
            {t("workspace.export.error")}: {error}
          </span>
        )}
      </div>
    </div>
  );
}
