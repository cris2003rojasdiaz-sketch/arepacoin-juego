"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { useCoinSound } from "@/hooks/use-coin-sound"
import { BottomNav, type TabId } from "@/components/bottom-nav"
import {
  ReferidosView,
  RuletaView,
  MineriaView,
  SocialTasks,
  UPGRADES,
  type Upgrade,
  type SocialTask,
} from "@/components/tab-views"
import {
  WalletButton,
  WalletModal,
  RankingButton,
  LeaderboardModal,
  DailyRewardButton,
  randomSolanaAddress,
  type Wallet,
} from "@/components/game-features"

const MAX_ENERGY = 1500
const RECHARGE_PER_SECOND = 3
const TAP_COST = 1
const TAP_REWARD = 1
const REFERRAL_REWARD = 5000
const DAY_MS = 24 * 60 * 60 * 1000

type FloatingScore = { id: number; x: number; y: number }

export function TapGame() {
  // Balance en coma flotante para admitir ingresos pasivos fraccionados/seg.
  const [balance, setBalance] = useState(0)
  const [energy, setEnergy] = useState(MAX_ENERGY)
  const [tab, setTab] = useState<TabId>("tap")
  const [popping, setPopping] = useState(false)
  const [floats, setFloats] = useState<FloatingScore[]>([])

  // Estado de progresión.
  const [owned, setOwned] = useState<Record<string, number>>({})
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(
    {},
  )
  const [friends, setFriends] = useState(0)

  // Billetera Solana (persiste entre pestañas porque vive aquí).
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [showWallet, setShowWallet] = useState(false)

  // Ranking (leaderboard).
  const [showRanking, setShowRanking] = useState(false)

  // Recompensa diaria: racha + próximo reclamo disponible.
  const [streak, setStreak] = useState(0)
  const [nextClaimAt, setNextClaimAt] = useState<number | null>(null)

  const playCoin = useCoinSound()
  const floatId = useRef(0)
  const popTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ganancia pasiva por hora derivada de las mejoras compradas.
  const perHour = useMemo(
    () =>
      UPGRADES.reduce((sum, u) => sum + (owned[u.id] ?? 0) * u.perHour, 0),
    [owned],
  )

  // Recarga automática de energía: +3 por segundo, tope en MAX_ENERGY.
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(MAX_ENERGY, prev + RECHARGE_PER_SECOND))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Minería pasiva: suma la fracción correspondiente al balance cada segundo.
  useEffect(() => {
    if (perHour <= 0) return
    const interval = setInterval(() => {
      setBalance((b) => b + perHour / 3600)
    }, 1000)
    return () => clearInterval(interval)
  }, [perHour])

  useEffect(() => {
    return () => {
      if (popTimeout.current) clearTimeout(popTimeout.current)
    }
  }, [])

  const addBalance = useCallback((n: number) => setBalance((b) => b + n), [])

  const handleTap = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (energy < TAP_COST) return

      setBalance((b) => b + TAP_REWARD)
      setEnergy((en) => Math.max(0, en - TAP_COST))
      playCoin()

      // Rebote de la arepa.
      setPopping(false)
      requestAnimationFrame(() => setPopping(true))
      if (popTimeout.current) clearTimeout(popTimeout.current)
      popTimeout.current = setTimeout(() => setPopping(false), 240)

      // "+1" flotante en la posición del toque.
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = floatId.current++
      setFloats((prev) => [...prev, { id, x, y }])
      setTimeout(() => {
        setFloats((prev) => prev.filter((f) => f.id !== id))
      }, 800)
    },
    [energy, playCoin],
  )

  // Comprar una mejora de cocina: descuenta el costo y sube de nivel.
  const handleBuy = useCallback(
    (u: Upgrade) => {
      if (balance < u.cost) return
      setBalance((b) => b - u.cost)
      setOwned((prev) => ({ ...prev, [u.id]: (prev[u.id] ?? 0) + 1 }))
      playCoin()
    },
    [balance, playCoin],
  )

  // Completar una tarea social: otorga la recompensa una sola vez.
  const handleCompleteTask = useCallback(
    (t: SocialTask) => {
      if (completedTasks[t.id]) return
      addBalance(t.reward)
      setCompletedTasks((prev) => ({ ...prev, [t.id]: true }))
      playCoin()
    },
    [completedTasks, addBalance, playCoin],
  )

  // Invitar a un amigo (al copiar el enlace): +5.000 $AREPA.
  const handleInvite = useCallback(() => {
    addBalance(REFERRAL_REWARD)
    setFriends((f) => f + 1)
    playCoin()
  }, [addBalance, playCoin])

  // Conectar una billetera de Solana: genera una dirección simulada.
  const handleSelectWallet = useCallback(
    (provider: string) => {
      setWallet({ provider, address: randomSolanaAddress() })
      setShowWallet(false)
      playCoin()
    },
    [playCoin],
  )

  const handleDisconnectWallet = useCallback(() => {
    setWallet(null)
    setShowWallet(false)
  }, [])

  // Reclamar la recompensa diaria: bono según la racha (Día N: +N*500).
  const handleClaimDaily = useCallback(() => {
    const now = Date.now()
    if (nextClaimAt && now < nextClaimAt) return
    const newStreak = streak + 1
    addBalance(newStreak * 500)
    setStreak(newStreak)
    setNextClaimAt(now + DAY_MS)
    playCoin()
  }, [streak, nextClaimAt, addBalance, playCoin])

  const energyPct = (energy / MAX_ENERGY) * 100
  const lowEnergy = energy < TAP_COST
  const displayBalance = Math.floor(balance)

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
      {/* Barra superior: ranking + billetera */}
      <header className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <RankingButton onClick={() => setShowRanking(true)} />
          <WalletButton wallet={wallet} onClick={() => setShowWallet(true)} />
        </div>

        {/* Marcador de balance */}
        <div className="mx-auto flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3 backdrop-blur-md">
          <span className="text-2xl" aria-hidden="true">
            💰
          </span>
          <p className="text-lg font-bold tabular-nums text-foreground">
            Balance:{" "}
            <span className="text-primary">
              {displayBalance.toLocaleString("es")}
            </span>{" "}
            <span className="text-muted-foreground">$AREPA</span>
          </p>
        </div>
      </header>

      {/* Contenido según pestaña (área desplazable) */}
      <div className="flex-1 overflow-y-auto py-4">
        {tab === "tap" ? (
          <section className="flex min-h-full flex-col items-center">
            <div className="mb-3 w-full">
              <DailyRewardButton
                streak={streak}
                nextClaimAt={nextClaimAt}
                onClaim={handleClaimDaily}
              />
            </div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              ¡Toca la arepa para ganar!
            </p>
            <div className="relative flex items-center justify-center py-2">
              <button
                type="button"
                onPointerDown={handleTap}
                disabled={lowEnergy}
                aria-label="Tocar la arepa para ganar monedas"
                className="relative touch-none select-none rounded-full outline-none transition-opacity disabled:opacity-50"
              >
                {/* Halo detrás de la arepa */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-2xl"
                />
                <span
                  className={`block overflow-hidden rounded-full ring-4 ring-primary/40 drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)] ${
                    popping ? "animate-arepa-pop" : ""
                  }`}
                >
                  <Image
                    src="/arepa.png"
                    alt="Arepa dorada, botón principal del juego"
                    width={288}
                    height={288}
                    priority
                    draggable={false}
                    className="h-52 w-52 sm:h-64 sm:w-64"
                  />
                </span>

                {/* Puntajes flotantes "+1" */}
                {floats.map((f) => (
                  <span
                    key={f.id}
                    aria-hidden="true"
                    className="animate-float-up pointer-events-none absolute z-10 text-2xl font-extrabold text-primary drop-shadow"
                    style={{ left: f.x, top: f.y }}
                  >
                    +{TAP_REWARD}
                  </span>
                ))}
              </button>
            </div>

            {/* Tareas de redes sociales */}
            <div className="mt-4 w-full">
              <SocialTasks
                completed={completedTasks}
                onComplete={handleCompleteTask}
              />
            </div>
          </section>
        ) : tab === "referidos" ? (
          <ReferidosView friends={friends} onInvite={handleInvite} />
        ) : tab === "ruleta" ? (
          <RuletaView />
        ) : (
          <MineriaView
            balance={balance}
            owned={owned}
            perHour={perHour}
            onBuy={handleBuy}
          />
        )}
      </div>

      {/* Barra de energía */}
      <div className="shrink-0 px-1 pb-3 pt-1">
        <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-1 text-foreground">
            <span aria-hidden="true">⚡</span> Energía
          </span>
          <span className="tabular-nums text-muted-foreground">
            {energy.toLocaleString("es")} / {MAX_ENERGY.toLocaleString("es")}
          </span>
        </div>
        <div
          className="h-3.5 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={energy}
          aria-valuemin={0}
          aria-valuemax={MAX_ENERGY}
          aria-label="Energía disponible"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-[width] duration-300 ease-out"
            style={{ width: `${energyPct}%` }}
          />
        </div>
      </div>

      {/* Menú de navegación */}
      <div className="shrink-0">
        <BottomNav active={tab} onChange={setTab} />
      </div>

      {/* Modales */}
      <WalletModal
        open={showWallet}
        wallet={wallet}
        onSelect={handleSelectWallet}
        onDisconnect={handleDisconnectWallet}
        onClose={() => setShowWallet(false)}
      />
      <LeaderboardModal
        open={showRanking}
        playerBalance={balance}
        onClose={() => setShowRanking(false)}
      />
    </main>
  )
}
