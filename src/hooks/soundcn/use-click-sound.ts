import { metalClickSound } from "@/lib/soundcn/metal-click"

import { useSound } from "./use-sound"
import { useSoundPreference } from "./use-sound-preference"

export function useClickSound() {
  const { enabled } = useSoundPreference()
  const [playOriginal, controls] = useSound(metalClickSound, {
    volume: 0.95,
    soundEnabled: enabled,
  })

  const playClick = () => {
    if (!enabled) return

    try {
      // Play signature soft tactile UI tab switch pop
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sine"
        osc.frequency.setValueAtTime(240, now)
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.038)

        gain.gain.setValueAtTime(0.45, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.05)
      }
    } catch {
      // Fallback to sample player
      playOriginal()
    }
  }

  return [playClick, controls] as const
}
