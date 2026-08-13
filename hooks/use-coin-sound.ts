"use client"

import { useCallback, useRef } from "react"

/**
 * Genera un "clic de moneda" limpio usando la Web Audio API.
 * No requiere archivos de audio externos: sintetiza dos tonos rápidos
 * (un "ding" agudo y brillante) con una envolvente corta.
 */
export function useCoinSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      ctxRef.current = new Ctor()
    }
    return ctxRef.current
  }, [])

  const play = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    // En móviles el contexto puede quedar suspendido hasta la primera interacción.
    if (ctx.state === "suspended") void ctx.resume()

    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.3, now + 0.005)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    master.connect(ctx.destination)

    // Dos frecuencias que dan el brillo característico de una moneda.
    const freqs = [1318.5, 1975.5] // Mi6 y Si6
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = "square"
      osc.frequency.setValueAtTime(f, now + i * 0.02)
      g.gain.setValueAtTime(i === 0 ? 0.6 : 0.35, now)
      osc.connect(g)
      g.connect(master)
      osc.start(now + i * 0.02)
      osc.stop(now + 0.2)
    })
  }, [getCtx])

  return play
}
