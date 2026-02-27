import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { pickFile } from "../../lib/tauriApi";

const AUDIO_VIDEO_EXTENSIONS = [
  "mp4", "mkv", "avi", "mov", "webm", "flv",
  "mp3", "wav", "flac", "ogg", "aac", "m4a", "wma",
];

interface FileInputProps {
  onFileSelected: (path: string) => void;
  disabled?: boolean;
}

export function FileInput({ onFileSelected, disabled }: FileInputProps) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleBrowse = useCallback(async () => {
    const selected = await pickFile([
      { name: "Media Files", extensions: AUDIO_VIDEO_EXTENSIONS },
    ]);
    if (selected) {
      setSelectedFile(selected);
      onFileSelected(selected);
    }
  }, [onFileSelected]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        const path = file.name;
        setSelectedFile(path);
        onFileSelected(path);
      }
    },
    [onFileSelected],
  );

  return (
    <div className="mb-4">
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-slate-500"
        } ${disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handleBrowse}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-500"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-sm text-slate-400">{t("workspace.fileInput.dropzone")}</p>
        <button
          className="cursor-pointer rounded-md bg-surface px-4 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowse();
          }}
        >
          {t("workspace.fileInput.browse")}
        </button>
      </div>
      {selectedFile && (
        <p className="mt-2 truncate text-xs text-slate-500">
          {t("workspace.fileInput.selectedFile")}: {selectedFile}
        </p>
      )}
    </div>
  );
}
