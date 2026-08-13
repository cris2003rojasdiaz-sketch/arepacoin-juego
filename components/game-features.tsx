"use client"

import { useEffect, useState } from "react"

const fmt = (n: number) => Math.floor(n).toLocaleString("es")

/* ============================ Billetera (Solana) =========================== */

export type Wallet = { provider: string; address: string }

const SOLANA_WALLETS = [
  { id: "phantom", name: "Phantom", emoji: "👻", color: "var(--chart-4)" },
  { id: "solflare", name: "Solflare", emoji: "🔆", color: "var(--chart-1)" },
]

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

/** Genera una dirección estilo Solana (base58) para la simulación. */
export function randomSolanaAddress() {
  let addr = ""
  for (let i = 0; i < 44; i++) {
    addr += BASE58[Math.floor(Math.random() * BASE58.length)]
  }
  return addr
}

/** Acorta una dirección al formato "Ab5x...8qZ". */
export function shortAddress(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-3)}`
}

/** Botón de la esquina superior derecha. */
export function WalletButton({
  wallet,
  onClick,
}: {
  wallet: Wallet | null
  onClick: () => void
}) {
  const connected = !!wallet
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        connected ? "Billetera Solana conectada" : "Conectar billetera"
      }
      className={
        connected
          ? "flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/15 px-3 py-2 text-xs font-bold text-primary shadow-sm transition-transform active:scale-95"
          : "flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-lg transition-transform active:scale-95"
      }
    >
      {connected ? (
        <>
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
          />
          <span className="font-mono tabular-nums">
            Solana: {shortAddress(wallet!.address)}
          </span>
        </>
      ) : (
        <>
          <span aria-hidden="true">🔗</span>
          <span>Conectar Billetera</span>
        </>
      )}
    </button>
  )
}

/** Modal de selección de billetera Solana. */
export function WalletModal({
  open,
  wallet,
  onSelect,
  onDisconnect,
  onClose,
}: {
  open: boolean
  wallet: Wallet | null
  onSelect: (provider: string) => void
  onDisconnect: () => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <ModalShell title="Conectar billetera" onClose={onClose}>
      {wallet ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Conectado con {wallet.provider}
            </p>
            <p className="mt-1 break-all font-mono text-sm text-primary">
              {wallet.address}
            </p>
          </div>
          <button
            type="button"
            onClick={onDisconnect}
            className="w-full rounded-xl border border-border bg-secondary py-3 text-sm font-bold text-foreground transition-transform active:scale-95"
          >
            Desconectar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm text-muted-foreground">
            Elige tu billetera de Solana para continuar
          </p>
          {SOLANA_WALLETS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onSelect(w.name)}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-transform active:scale-[0.98]"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: w.color }}
                aria-hidden="true"
              >
                {w.emoji}
              </span>
              <span className="flex-1 text-sm font-bold text-foreground">
                {w.name}
              </span>
              <span className="text-muted-foreground" aria-hidden="true">
                ›
              </span>
            </button>
          ))}
        </div>
      )}
    </ModalShell>
  )
}

/* ============================ Recompensa diaria ============================ */

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = String(Math.floor(total / 3600)).padStart(2, "0")
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0")
  const s = String(total % 60).padStart(2, "0")
  return `${h}:${m}:${s}`
}

/** Botón de recompensa diaria con racha y cuenta regresiva de 24 h. */
export function DailyRewardButton({
  streak,
  nextClaimAt,
  onClaim,
}: {
  streak: number
  nextClaimAt: number | null
  onClaim: () => void
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const claimable = !nextClaimAt || now >= nextClaimAt
  const nextReward = (streak + 1) * 500
  const remaining = nextClaimAt ? nextClaimAt - now : 0

  return (
    <button
      type="button"
      onClick={onClaim}
      disabled={!claimable}
      className={
        claimable
          ? "flex w-full max-w-sm items-center gap-3 rounded-2xl border border-primary/50 bg-gradient-to-r from-accent/20 to-primary/20 p-3 text-left shadow-lg transition-transform active:scale-[0.98]"
          : "flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left opacity-80"
      }
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl text-primary-foreground"
        aria-hidden="true"
      >
        📅
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">Recompensa Diaria</p>
        {claimable ? (
          <p className="text-xs font-medium text-primary">
            Día {streak + 1} · Reclama +{fmt(nextReward)} $AREPA
          </p>
        ) : (
          <p className="text-xs font-medium tabular-nums text-muted-foreground">
            Próxima en {formatCountdown(remaining)}
          </p>
        )}
      </div>
      {claimable && (
        <span className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
          Reclamar
        </span>
      )}
    </button>
  )
}

/* =============================== Leaderboard =============================== */

type Player = { name: string; emoji: string; balance: number }

const TOP_PLAYERS: Player[] = [
  { name: "CryptoArepa", emoji: "🐋", balance: 2_450_000 },
  { name: "MaízKing", emoji: "👑", balance: 1_890_000 },
  { name: "TokenTequeño", emoji: "🔥", balance: 1_203_000 },
  { name: "SatoshiLlanero", emoji: "🤠", balance: 987_500 },
  { name: "ArepaWhale", emoji: "🌽", balance: 654_000 },
]

const MEDALS = ["🥇", "🥈", "🥉"]

/** Botón de la esquina superior izquierda que abre el ranking. */
export function RankingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ver ranking de jugadores"
      className="flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-2 text-xs font-bold text-foreground shadow-sm backdrop-blur-md transition-transform active:scale-95"
    >
      <span aria-hidden="true">🏆</span>
      <span>Ranking</span>
    </button>
  )
}

/** Modal con el top 5 de jugadores + la posición del usuario. */
export function LeaderboardModal({
  open,
  playerBalance,
  onClose,
}: {
  open: boolean
  playerBalance: number
  onClose: () => void
}) {
  if (!open) return null

  // Inserta al jugador y calcula su posición global.
  const ranked = [
    ...TOP_PLAYERS,
    { name: "Tú", emoji: "🫵", balance: Math.floor(playerBalance) },
  ].sort((a, b) => b.balance - a.balance)

  const top5 = ranked.slice(0, 5)
  const youIndex = ranked.findIndex((p) => p.name === "Tú")
  const youInTop5 = youIndex < 5

  return (
    <ModalShell title="🏆 Ranking Global" onClose={onClose}>
      <p className="mb-3 text-center text-sm text-muted-foreground">
        Los 5 jugadores con más $AREPA
      </p>
      <ol className="flex flex-col gap-2">
        {top5.map((p, i) => {
          const isYou = p.name === "Tú"
          return (
            <li
              key={p.name}
              className={
                isYou
                  ? "flex items-center gap-3 rounded-2xl border border-primary/50 bg-primary/15 p-3"
                  : "flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              }
            >
              <span className="w-7 shrink-0 text-center text-lg font-extrabold tabular-nums">
                {i < 3 ? MEDALS[i] : <span className="text-muted-foreground">{i + 1}</span>}
              </span>
              <span className="text-xl" aria-hidden="true">
                {p.emoji}
              </span>
              <span
                className={
                  isYou
                    ? "flex-1 truncate text-sm font-extrabold text-primary"
                    : "flex-1 truncate text-sm font-bold text-foreground"
                }
              >
                {p.name}
              </span>
              <span className="shrink-0 tabular-nums text-sm font-bold text-primary">
                {fmt(p.balance)}
              </span>
            </li>
          )
        })}
      </ol>

      {!youInTop5 && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/50 bg-primary/15 p-3">
          <span className="w-7 shrink-0 text-center text-sm font-extrabold tabular-nums text-primary">
            {youIndex + 1}
          </span>
          <span className="text-xl" aria-hidden="true">
            🫵
          </span>
          <span className="flex-1 truncate text-sm font-extrabold text-primary">
            Tú
          </span>
          <span className="shrink-0 tabular-nums text-sm font-bold text-primary">
            {fmt(playerBalance)}
          </span>
        </div>
      )}
    </ModalShell>
  )
}

/* ============================== Shell de modal ============================= */

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-border bg-background p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-lg text-muted-foreground transition-transform active:scale-90"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
