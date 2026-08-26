"use client"

import { useCallback, useRef, useState } from "react"

import type {
  SoundAsset,
  UseSoundOptions,
  UseSoundReturn,
} from "@/lib/soundcn/sound-types"

export function useSound(
  sound: SoundAsset,
  options: UseSoundOptions = {}
): UseSoundReturn {
  const {
    volume = 1,
    playbackRate = 1,
    interrupt = false,
    soundEnabled = true,
    onPlay,
    onEnd,
    onPause,
    onStop,
  } = options

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState<number | null>(
    sound.duration ?? null
  )
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const decodingRef = useRef<Promise<AudioBuffer> | null>(null)

  const ensureBuffer = useCallback(async () => {
    if (bufferRef.current) return bufferRef.current
    if (!decodingRef.current) {
      decodingRef.current = import("@/lib/soundcn/sound-engine").then(
        ({ decodeAudioData }) => decodeAudioData(sound.dataUri)
      )
    }
    const buffer = await decodingRef.current
    bufferRef.current = buffer
    setDuration(buffer.duration)
    return buffer
  }, [sound.dataUri])

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch {
        // Already stopped
      }
      sourceRef.current = null
    }
    setIsPlaying(false)
    onStop?.()
  }, [onStop])

  const play = useCallback(
    async (overrides?: { volume?: number; playbackRate?: number }) => {
      if (!soundEnabled) return

      const buffer = await ensureBuffer()
      if (!buffer) return

      const { getAudioContext } = await import("@/lib/soundcn/sound-engine")
      const ctx = getAudioContext()

      if (ctx.state === "suspended") {
        ctx.resume()
      }

      if (interrupt && sourceRef.current) {
        stop()
      }

      const source = ctx.createBufferSource()
      const gain = ctx.createGain()

      source.buffer = buffer
      source.playbackRate.value = overrides?.playbackRate ?? playbackRate
      gain.gain.value = overrides?.volume ?? volume

      source.connect(gain)
      gain.connect(ctx.destination)

      source.onended = () => {
        setIsPlaying(false)
        onEnd?.()
      }

      source.start(0)
      sourceRef.current = source
      gainRef.current = gain
      setIsPlaying(true)
      onPlay?.()
    },
    [
      soundEnabled,
      playbackRate,
      volume,
      interrupt,
      stop,
      onPlay,
      onEnd,
      ensureBuffer,
    ]
  )

  const pause = useCallback(() => {
    stop()
    onPause?.()
  }, [stop, onPause])

  return [play, { stop, pause, isPlaying, duration, sound }] as const
}
