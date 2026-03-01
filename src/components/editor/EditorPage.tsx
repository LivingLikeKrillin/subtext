import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Save, Download, FileText, Undo2, Redo2 } from "lucide-react"
import { toastSuccess, toastError } from "@/lib/toast"
import { convertFileSrc } from "@tauri-apps/api/core"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Waveform } from "./Waveform"
import { SubtitleList } from "./SubtitleList"
import { EditPanel } from "./EditPanel"
import { PlaybackControls } from "./PlaybackControls"
import { loadJobSubtitles, saveJobSubtitles, exportSubtitles } from "@/lib/tauriApi"
import { splitLine, mergeLines, reindex, getSplitTime, canSplit, canMerge } from "@/lib/subtitleOps"
import { useHistory } from "@/hooks/useHistory"
import type { SubtitleLine } from "@/types"

interface EditorPageProps {
  jobId: string | null
  filePath: string | null
  outputDir: string
  subtitleFormat: string
}

export function EditorPage({ jobId, filePath, outputDir, subtitleFormat }: EditorPageProps) {
  const { t } = useTranslation()
  const { present: lines, push: pushLines, undo, redo, reset: resetLines, canUndo, canRedo } = useHistory<SubtitleLine[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)

  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioReady, setAudioReady] = useState(false)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [peaks, setPeaks] = useState<number[]>([])
  const [volume, setVolume] = useState(1)

  // Load subtitles when jobId changes
  useEffect(() => {
    if (!jobId) {
      resetLines([])
      setSelectedId(null)
      setCurrentTime(0)
      setDirty(false)
      return
    }

    loadJobSubtitles(jobId)
      .then((data) => {
        resetLines(data)
        setSelectedId(null)
        setCurrentTime(0)
        setDirty(false)
      })
      .catch((e) => {
        console.error("Failed to load subtitles:", e)
        toastError(t("toast.subtitleLoadFailed"))
      })
  }, [jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Audio lifecycle: create HTMLAudioElement when filePath changes
  useEffect(() => {
    // Reset audio state
    setAudioReady(false)
    setAudioDuration(null)
    setPeaks([])

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current = null
    }

    if (!filePath) return

    const assetUrl = convertFileSrc(filePath)
    const audio = new Audio()
    audioRef.current = audio
    audio.volume = volume
    audio.playbackRate = playbackRate

    const onLoadedMetadata = () => {
      setAudioDuration(audio.duration)
      setAudioReady(true)
    }
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }
    const onEnded = () => {
      setIsPlaying(false)
    }
    const onError = () => {
      console.warn("Audio load failed, falling back to timer simulation")
      setAudioReady(false)
    }

    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("error", onError)
    audio.src = assetUrl

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
      audio.pause()
      audio.src = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath])

  // Peaks extraction after audio is ready
  useEffect(() => {
    if (!audioReady || !filePath) return

    const assetUrl = convertFileSrc(filePath)
    let cancelled = false

    async function extractPeaks() {
      try {
        const response = await fetch(assetUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioCtx = new AudioContext()
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

        if (cancelled) { audioCtx.close(); return }

        // Mono mixdown
        const numChannels = audioBuffer.numberOfChannels
        const length = audioBuffer.length
        const mono = new Float32Array(length)
        for (let ch = 0; ch < numChannels; ch++) {
          const channelData = audioBuffer.getChannelData(ch)
          for (let i = 0; i < length; i++) {
            mono[i] += channelData[i] / numChannels
          }
        }

        // Bucket into 2000 max-amplitude peaks
        const bucketCount = Math.min(2000, length)
        const bucketSize = Math.floor(length / bucketCount)
        const result: number[] = []
        for (let b = 0; b < bucketCount; b++) {
          let max = 0
          const start = b * bucketSize
          const end = Math.min(start + bucketSize, length)
          for (let i = start; i < end; i++) {
            const abs = Math.abs(mono[i])
            if (abs > max) max = abs
          }
          result.push(max)
        }

        if (!cancelled) setPeaks(result)
        audioCtx.close()
      } catch (e) {
        console.warn("Peak extraction failed:", e)
        if (!cancelled) setPeaks([])
      }
    }

    extractPeaks()
    return () => { cancelled = true }
  }, [audioReady, filePath])

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // Sync playback rate to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  const subtitleDuration = useMemo(() => {
    if (lines.length === 0) return 0
    return Math.max(...lines.map((l) => l.end_time))
  }, [lines])

  const duration = audioDuration ?? subtitleDuration

  const selectedLine = useMemo(
    () => lines.find((l) => l.id === selectedId) ?? null,
    [lines, selectedId],
  )

  // Timer simulation fallback (only when audio is NOT ready)
  useEffect(() => {
    if (audioReady) return // real audio handles timeupdate
    if (!isPlaying) return
    const intervalMs = 100
    const interval = setInterval(() => {
      setCurrentTime((t) => {
        if (t >= duration) {
          setIsPlaying(false)
          return 0
        }
        return t + (intervalMs / 1000) * playbackRate
      })
    }, intervalMs)
    return () => clearInterval(interval)
  }, [audioReady, isPlaying, duration, playbackRate])

  // Auto-select subtitle during playback (Sprint 4)
  useEffect(() => {
    if (!isPlaying) return
    const active = lines.find((l) => currentTime >= l.start_time && currentTime <= l.end_time)
    if (active && active.id !== selectedId) {
      setSelectedId(active.id)
    }
  }, [currentTime, isPlaying, lines, selectedId])

  const handleUpdateLine = useCallback((id: string, updates: Partial<SubtitleLine>) => {
    const updated = lines.map((l) => (l.id === id ? { ...l, ...updates } : l))
    pushLines(updated)
    setDirty(true)
  }, [lines, pushLines])

  const handleSave = useCallback(async () => {
    if (!jobId) return
    try {
      await saveJobSubtitles(jobId, lines)
      setDirty(false)
      toastSuccess(t("toast.subtitleSaved"))
    } catch (e) {
      console.error("Failed to save subtitles:", e)
      toastError(t("toast.subtitleSaveFailed"))
    }
  }, [jobId, lines, t])

  const handleExport = useCallback(async () => {
    if (!jobId || lines.length === 0) return
    try {
      const segments = lines.map((l) => ({
        index: l.index,
        start: l.start_time,
        end: l.end_time,
        text: l.original_text,
        translated: l.translated_text || undefined,
      }))
      await exportSubtitles(segments, subtitleFormat, outputDir, jobId)
      toastSuccess(t("toast.exportSuccess"))
    } catch (e) {
      console.error("Failed to export:", e)
      toastError(t("toast.exportFailed"))
    }
  }, [jobId, lines, subtitleFormat, outputDir, t])

  const handleSplitLine = useCallback((id: string) => {
    const idx = lines.findIndex((l) => l.id === id)
    if (idx < 0) return
    const line = lines[idx]
    if (!canSplit(line)) return
    const time = getSplitTime(line, currentTime)
    const [first, second] = splitLine(line, time)
    const next = [...lines]
    next.splice(idx, 1, first, second)
    pushLines(reindex(next))
    setSelectedId(first.id)
    setDirty(true)
  }, [lines, currentTime, pushLines])

  const handleMergeWithNext = useCallback((id: string) => {
    const idx = lines.findIndex((l) => l.id === id)
    if (idx < 0 || idx >= lines.length - 1) return
    const merged = mergeLines(lines[idx], lines[idx + 1])
    const next = [...lines]
    next.splice(idx, 2, merged)
    pushLines(reindex(next))
    setSelectedId(merged.id)
    setDirty(true)
  }, [lines, pushLines])

  const handleDeleteLine = useCallback((id: string) => {
    const next = reindex(lines.filter((l) => l.id !== id))
    pushLines(next)
    if (selectedId === id) setSelectedId(null)
    setDirty(true)
  }, [lines, pushLines, selectedId])

  const handleTogglePlay = useCallback(() => {
    if (audioReady && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
    setIsPlaying((p) => !p)
  }, [audioReady, isPlaying])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const isEditing = tag === "INPUT" || tag === "TEXTAREA"

      // Ctrl+Z — Undo (always)
      if (e.ctrlKey && !e.shiftKey && e.key === "z") {
        e.preventDefault()
        undo()
        setDirty(true)
        return
      }
      // Ctrl+Y or Ctrl+Shift+Z — Redo (always)
      if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "Z")) {
        e.preventDefault()
        redo()
        setDirty(true)
        return
      }
      // Ctrl+S — Save (always)
      if (e.ctrlKey && !e.shiftKey && e.key === "s") {
        e.preventDefault()
        handleSave()
        return
      }
      // Space — Play/Pause (not in text fields)
      if (e.key === " " && !isEditing) {
        e.preventDefault()
        handleTogglePlay()
        return
      }
      // Delete — Delete subtitle (not in text fields)
      if (e.key === "Delete" && !isEditing && selectedId) {
        e.preventDefault()
        handleDeleteLine(selectedId)
        return
      }
      // Ctrl+Shift+S — Split
      if (e.ctrlKey && e.shiftKey && e.key === "S" && selectedId) {
        e.preventDefault()
        handleSplitLine(selectedId)
        return
      }
      // Ctrl+Shift+M — Merge
      if (e.ctrlKey && e.shiftKey && e.key === "M" && selectedId) {
        e.preventDefault()
        handleMergeWithNext(selectedId)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedId, handleSplitLine, handleMergeWithNext, handleDeleteLine, handleSave, handleTogglePlay, undo, redo])

  const canSplitLine = useMemo(() => {
    return selectedLine ? canSplit(selectedLine) : false
  }, [selectedLine])

  const canMergeLine = useMemo(() => {
    return selectedLine ? canMerge(selectedLine, lines) : false
  }, [selectedLine, lines])

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }, [])

  const handleSkipPrev = useCallback(() => {
    const prev = [...lines].reverse().find((l) => l.start_time < currentTime - 0.5)
    if (prev) {
      setCurrentTime(prev.start_time)
      setSelectedId(prev.id)
      if (audioRef.current) audioRef.current.currentTime = prev.start_time
    } else {
      setCurrentTime(0)
      if (audioRef.current) audioRef.current.currentTime = 0
    }
  }, [lines, currentTime])

  const handleSkipNext = useCallback(() => {
    const next = lines.find((l) => l.start_time > currentTime + 0.1)
    if (next) {
      setCurrentTime(next.start_time)
      setSelectedId(next.id)
      if (audioRef.current) audioRef.current.currentTime = next.start_time
    }
  }, [lines, currentTime])

  // Empty state
  if (!jobId) {
    return (
      <div className="flex flex-1 items-center justify-center text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
            <FileText className="h-8 w-8 text-muted-foreground/70" />
          </div>
          <div>
            <p className="font-medium">{t("editor.empty.title")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("editor.empty.description")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-1 pb-3 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {lines.length} {t("editor.subtitlesCount")}
          </span>
          {dirty && (
            <span className="text-xs text-yellow-500">{t("editor.unsaved")}</span>
          )}
        </div>
        <TooltipProvider>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={!canUndo}>
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{t("editor.undo")} <kbd className="ml-1 text-[10px] opacity-60">Ctrl+Z</kbd></p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={!canRedo}>
                  <Redo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{t("editor.redo")} <kbd className="ml-1 text-[10px] opacity-60">Ctrl+Y</kbd></p></TooltipContent>
            </Tooltip>
            <div className="w-px h-4 bg-border mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleSave} disabled={!dirty}>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {t("editor.save")}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p><kbd className="text-[10px] opacity-60">Ctrl+S</kbd></p></TooltipContent>
            </Tooltip>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={lines.length === 0}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {t("editor.export")}
            </Button>
          </div>
        </TooltipProvider>
      </div>

      {/* Main content: waveform + panels */}
      <div className="flex flex-1 flex-col min-h-0">
        {/* Waveform */}
        <div className="h-[100px] border-b shrink-0">
          <Waveform
            lines={lines}
            currentTime={currentTime}
            selectedId={selectedId}
            duration={duration}
            peaks={peaks}
            onSeek={handleSeek}
            onSelect={setSelectedId}
          />
        </div>

        {/* Playback controls */}
        <PlaybackControls
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          volume={volume}
          playbackRate={playbackRate}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onSkipPrev={handleSkipPrev}
          onSkipNext={handleSkipNext}
          onVolumeChange={setVolume}
          onPlaybackRateChange={setPlaybackRate}
        />

        {/* Subtitle list + Edit panel */}
        <ResizablePanelGroup className="flex-1 min-h-0">
          <ResizablePanel defaultSize={55} minSize={30}>
            <SubtitleList
              lines={lines}
              selectedId={selectedId}
              currentTime={currentTime}
              onSelect={setSelectedId}
              onSplit={handleSplitLine}
              onMergeWithNext={handleMergeWithNext}
              onDelete={handleDeleteLine}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={45} minSize={25}>
            <EditPanel
              line={selectedLine}
              onUpdateLine={handleUpdateLine}
              onSplit={handleSplitLine}
              onMergeWithNext={handleMergeWithNext}
              onDelete={handleDeleteLine}
              canSplitLine={canSplitLine}
              canMergeLine={canMergeLine}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
