import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
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
        <Upload size={32} strokeWidth={1.5} className="text-slate-500" />
        <p className="text-sm text-slate-400">{t("workspace.fileInput.dropzone")}</p>
        <button
          className="cursor-pointer rounded-md bg-surface-hover px-4 py-1.5 text-xs text-slate-300 transition-colors hover:bg-surface-hover/80"
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
