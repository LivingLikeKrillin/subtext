import { useEffect, useRef } from "react"

interface VideoPreviewProps {
  videoElement: HTMLVideoElement | null
}

export function VideoPreview({ videoElement }: VideoPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !videoElement) return

    videoElement.className = "w-full h-full object-contain bg-black rounded-md"
    container.appendChild(videoElement)

    return () => {
      if (container.contains(videoElement)) {
        container.removeChild(videoElement)
      }
    }
  }, [videoElement])

  return (
    <div
      ref={containerRef}
      className="h-[200px] shrink-0 border-b bg-black/5 dark:bg-black/20"
    />
  )
}
