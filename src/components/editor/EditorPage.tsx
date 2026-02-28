import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Save, Download, FileText } from "lucide-react"
import { convertFileSrc } from "@tauri-apps/api/core"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Waveform } from "./Waveform"
import { SubtitleList } from "./SubtitleList"
import { EditPanel } from "./EditPanel"
import { PlaybackControls } from "./PlaybackControls"
import { loadJobSubtitles, saveJobSubtitles, exportSubtitles } from "@/lib/tauriApi"
import type { SubtitleLine } from "@/types"

interface EditorPageProps {
  jobId: string | null
  filePath: string | null
  outputDir: string
  subtitleFormat: string
}

export function EditorPage({ jobId, filePath, outputDir, subtitleFormat }: EditorPageProps) {
  const { t } = useTranslation()
  const [lines, setLines] = useState<SubtitleLine[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioReady, setAudioReady] = useState(false)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [peaks, setPeaks] = useState<number[]>([])
  const [volume, setVolume] = useState(1)

  // Load subtitles when jobId changes
  useEffect(() => {
    if (!jobId) {
      setLines([])
      setSelectedId(null)
      setCurrentTime(0)
      setDirty(false)
      return
    }

    loadJobSubtitles(jobId)
      .then((data) => {
        setLines(data)
        setSelectedId(null)
        setCurrentTime(0)
        setDirty(false)
      })
      .catch((e) => console.error("Failed to load subtitles:", e))
  }, [jobId])

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
    const interval = setInterval(() => {
      setCurrentTime((t) => {
        if (t >= duration) {
          setIsPlaying(false)
          return 0
        }
        return t + 0.1
      })
    }, 100)
    return () => clearInterval(interval)
  }, [audioReady, isPlaying, duration])

  const handleUpdateLine = useCallback((id: string, updates: Partial<SubtitleLine>) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    )
    setDirty(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!jobId) return
    try {
      await saveJobSubtitles(jobId, lines)
      setDirty(false)
    } catch (e) {
      console.error("Failed to save subtitles:", e)
    }
  }, [jobId, lines])

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
    } catch (e) {
      console.error("Failed to export:", e)
    }
  }, [jobId, lines, subtitleFormat, outputDir])

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }, [])

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={!dirty}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {t("editor.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={lines.length === 0}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {t("editor.export")}
          </Button>
        </div>
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
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onSkipPrev={handleSkipPrev}
          onSkipNext={handleSkipNext}
          onVolumeChange={setVolume}
        />

        {/* Subtitle list + Edit panel */}
        <ResizablePanelGroup className="flex-1 min-h-0">
          <ResizablePanel defaultSize={55} minSize={30}>
            <SubtitleList
              lines={lines}
              selectedId={selectedId}
              currentTime={currentTime}
              onSelect={setSelectedId}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={45} minSize={25}>
            <EditPanel
              line={selectedLine}
              onUpdateLine={handleUpdateLine}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
