"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/* --------------------------- Tipos de Adsgram ----------------------------- */

type AdController = {
  show: () => Promise<void>
}

type AdsgramInit = (params: { blockId: string }) => AdController

declare global {
  interface Window {
    Adsgram?: { init: AdsgramInit }
  }
}

const BLOCK_ID = "42595"
const SCRIPT_SRC = "https://sad.adsgram.ai/js/sad.min.js"
const AD_REWARD = 2000
const COOLDOWN_MS = 60 * 60 * 1000 // 1 hora

let scriptPromise: Promise<void> | null = null

/** Carga el SDK oficial de Adsgram una sola vez. */
function loadAdsgram(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"))
  if (window.Adsgram) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("adsgram load error")))
      return
    }
    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("adsgram load error"))
    document.head.appendChild(script)
  })
  return scriptPromise
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/* ------------------------------- Componente ------------------------------- */

export function AdsgramButton({
  onReward,
  compact = false,
}: {
  onReward: (amount: number) => void
  /** Variante compacta para incrustar dentro de la lista de tareas. */
  compact?: boolean
}) {
  const [nextAvailableAt, setNextAvailableAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [loading, setLoading] = useState(false)
  const controllerRef = useRef<AdController | null>(null)

  // Prepara el controlador de Adsgram al montar (si el SDK carga).
  useEffect(() => {
    let active = true
    loadAdsgram()
      .then(() => {
        if (active && window.Adsgram) {
          controllerRef.current = window.Adsgram.init({ blockId: BLOCK_ID })
        }
      })
      .catch(() => {
        // Fuera de Telegram el SDK puede no cargar: usaremos el fallback.
      })
    return () => {
      active = false
    }
  }, [])

  // Reloj para el temporizador de bloqueo.
  useEffect(() => {
    if (!nextAvailableAt) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [nextAvailableAt])

  const locked = nextAvailableAt !== null && now < nextAvailableAt
  const remaining = nextAvailableAt ? nextAvailableAt - now : 0

  const grant = useCallback(() => {
    onReward(AD_REWARD)
    setNextAvailableAt(Date.now() + COOLDOWN_MS)
  }, [onReward])

  const handleWatch = useCallback(async () => {
    if (locked || loading) return
    setLoading(true)
    try {
      if (controllerRef.current) {
        // Anuncio real de Adsgram: la promesa resuelve al verlo completo.
        await controllerRef.current.show()
        grant()
      } else {
        // Fallback simulado (vista previa / fuera de Telegram):
        // espera breve simulando el video y luego otorga la recompensa.
        await new Promise((r) => setTimeout(r, 1200))
        grant()
      }
    } catch {
      // El usuario cerró el anuncio antes de terminar: no se otorga nada.
    } finally {
      setLoading(false)
    }
  }, [locked, loading, grant])

  const label = loading
    ? "Cargando anuncio…"
    : locked
      ? `Disponible en ${formatCountdown(remaining)}`
      : "Ver Anuncio (+2.000 $AREPA)"

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleWatch}
        disabled={locked || loading}
        className="flex w-full items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-3 text-left transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg text-primary-foreground">
          <span aria-hidden="true">▶️</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {locked ? "Anuncio recompensado" : "Ver Anuncio recompensado"}
          </p>
          <p className="text-xs font-medium text-primary">
            {locked ? `Disponible en ${formatCountdown(remaining)}` : "+2.000 $AREPA"}
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold text-muted-foreground" aria-hidden="true">
          {loading ? "…" : locked ? "⏳" : "›"}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleWatch}
      disabled={locked || loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span aria-hidden="true" className="text-lg">
        {loading ? "⏳" : locked ? "⏳" : "▶️"}
      </span>
      {label}
    </button>
  )
}
