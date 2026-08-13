"use client"

import { useEffect, useRef, useState } from "react"
import { AdsgramButton } from "@/components/adsgram-button"

/* ---------------------------------- Tipos --------------------------------- */

export type Upgrade = {
  id: string
  name: string
  emoji: string
  cost: number
  perHour: number
}

/** Mejoras de cocina disponibles para la minería pasiva. */
export const UPGRADES: Upgrade[] = [
  { id: "budare", name: "Budare de Hierro", emoji: "🍳", cost: 200, perHour: 5 },
  { id: "molino", name: "Molino Eléctrico", emoji: "⚙️", cost: 1000, perHour: 30 },
  { id: "horno", name: "Horno Industrial", emoji: "🏭", cost: 5000, perHour: 150 },
]

export type SocialTask = {
  id: string
  label: string
  icon: string
  reward: number
  url: string
  color: string
}

/** Misiones de redes sociales del panel de Tap (enlaces oficiales). */
export const SOCIAL_TASKS: SocialTask[] = [
  {
    id: "twitter",
    label: "Síguenos en X (Twitter)",
    icon: "𝕏",
    reward: 1500,
    url: "https://x.com/Arepacoins",
    color: "var(--chart-2)",
  },
  {
    id: "tiktok",
    label: "Síguenos en TikTok",
    icon: "🎵",
    reward: 1500,
    url: "https://www.tiktok.com/@arepacointokens",
    color: "var(--chart-3)",
  },
  {
    id: "telegram",
    label: "Únete al Canal Oficial",
    icon: "✈️",
    reward: 1000,
    url: "https://t.me/Arepa_CoinOficial",
    color: "var(--chart-4)",
  },
]

const fmt = (n: number) => Math.floor(n).toLocaleString("es")

/* --------------------------------- Header --------------------------------- */

function ViewHeader({
  emoji,
  title,
  description,
}: {
  emoji: string
  title: string
  description: string
}) {
  return (
    <div className="mb-5 text-center">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-3xl shadow-inner">
        <span aria-hidden="true">{emoji}</span>
      </div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="mx-auto mt-1 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

/* -------------------------------- Referidos ------------------------------- */

export function ReferidosView({
  friends,
  onInvite,
}: {
  friends: number
  onInvite: () => void
}) {
  const [copied, setCopied] = useState(false)
  const link = "t.me/ArepaCoinBot?start=user123"
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`)
    } catch {
      // Ignorar si el navegador bloquea el portapapeles.
    }
    setCopied(true)
    // Copiar el enlace "invita" a un amigo y otorga la recompensa.
    onInvite()
    if (copyTimeout.current) clearTimeout(copyTimeout.current)
    copyTimeout.current = setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <ViewHeader
        emoji="👥"
        title="Invita y gana"
        description="Comparte tu enlace único. Ganas 5.000 $AREPA por cada amigo que se una a jugar."
      />

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tu enlace de invitación
        </p>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
          <span className="truncate font-mono text-sm text-primary">{link}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg transition-transform active:scale-95"
        >
          {copied ? "¡Enlace copiado! +5.000 $AREPA 🎉" : "Copiar enlace e invitar"}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card/60 p-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span aria-hidden="true">🤝</span> Amigos invitados
        </span>
        <span className="tabular-nums text-lg font-bold text-primary">
          {friends}
        </span>
      </div>
    </div>
  )
}

/* --------------------------------- Ruleta --------------------------------- */

export function RuletaView() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center">
      <ViewHeader
        emoji="🎡"
        title="Ruleta de la suerte"
        description="Gira una vez al día y gana premios sorpresa en $AREPA. ¡Vuelve mañana!"
      />
      <div className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg">
        Próximo giro en 12:00 h
      </div>
    </div>
  )
}

/* -------------------------------- Minería --------------------------------- */

export function MineriaView({
  balance,
  owned,
  perHour,
  onBuy,
  isVip = false,
}: {
  balance: number
  owned: Record<string, number>
  perHour: number
  onBuy: (u: Upgrade) => void
  isVip?: boolean
}) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <ViewHeader
        emoji="⛏️"
        title="Minería pasiva"
        description="Compra mejoras de cocina para producir $AREPA automáticamente, incluso sin tocar."
      />

      {/* Ganancia por hora */}
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/10 p-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span aria-hidden="true">📈</span> Ganancia por hora
        </span>
        <span className="tabular-nums text-lg font-extrabold text-primary">
          +{fmt(perHour)} $AREPA
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {UPGRADES.map((u) => {
          const level = owned[u.id] ?? 0
          const cost = Math.floor(isVip ? u.cost * 0.8 : u.cost)
          const affordable = balance >= cost
          return (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
                <span aria-hidden="true">{u.emoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">
                  {u.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  +{u.perHour} $AREPA / hora
                  {level > 0 && (
                    <span className="ml-1 text-primary">· Nivel {level}</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onBuy(u)}
                disabled={!affordable}
                className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold tabular-nums text-primary-foreground shadow transition-transform active:scale-95 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none"
              >
                {fmt(u.cost)}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ----------------------------- Tareas sociales ---------------------------- */

export function SocialTasks({
  completed,
  onComplete,
  onAdReward,
}: {
  completed: Record<string, boolean>
  onComplete: (t: SocialTask) => void
  onAdReward: (amount: number) => void
}) {
  const handleClick = (t: SocialTask) => {
    if (completed[t.id]) return
    // Abre la red social simulada en una nueva pestaña.
    window.open(t.url, "_blank", "noopener,noreferrer")
    onComplete(t)
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span aria-hidden="true">🎯</span>
        <h3 className="text-sm font-bold text-foreground">
          Tareas de Redes Sociales
        </h3>
      </div>
      <div className="flex flex-col gap-2">
        <AdsgramButton compact onReward={onAdReward} />
        {SOCIAL_TASKS.map((t) => {
          const done = completed[t.id]
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleClick(t)}
              disabled={done}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg text-primary-foreground"
                style={{ backgroundColor: t.color }}
              >
                <span aria-hidden="true">{t.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {t.label}
                </p>
                <p className="text-xs font-medium text-primary">
                  +{fmt(t.reward)} $AREPA
                </p>
              </div>
              <span
                className="shrink-0 text-sm font-bold"
                aria-hidden="true"
              >
                {done ? (
                  <span className="text-primary">✓</span>
                ) : (
                  <span className="text-muted-foreground">›</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
