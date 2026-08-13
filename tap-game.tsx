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
} from "@/components/game-features"
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

type FloatingScore = { id: number; x: number; y: number; score: number }

export default function TapGame() {
  const [balance, setBalance] = useState(0)
  const [energy, setEnergy] = useState(MAX_ENERGY)
  const [tab, setTab] = useState<TabId>("tap")
  const [popping, setPopping] = useState(false)
  const [floats, setFloats] = useState<FloatingScore[]>([])
  const [owned, setOwned] = useState<Record<string, number>>({})
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [friends, setFriends] = useState([])
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [showWallet, setShowWallet] = useState(false)
  const [showRanking, setShowRanking] = useState(false)
  const [streak, setStreak] = useState(0)
  const [nextClaimAt, setNextClaimAt] = useState<number | null>(null)

  const { playCoin } = useCoinSound()
  const floatId = useRef(0)
  const popTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const adsgramController = useRef<any>(null)

  // 💵 INTEGRACIÓN DE ADSGRAM (ANUNCIOS REALES)
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://adsgram.ai"
    script.async = true
    script.onload = () => {
      if ((window as any).Adsgram) {
        adsgramController.current = (window as any).Adsgram.init({ 
          blockId: "42595" 
        })
      }
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  // Función para mostrar el anuncio y recargar energía al 100%
  const mostrarVideoRecompensa = async () => {
    if (adsgramController.current) {
      try {
        const result = await adsgramController.current.show()
        if (result && result.done) {
          setEnergy(MAX_ENERGY)
          alert("¡Arepa cocinada con éxito! Tu energía se ha recargado al 100%.")
        } else {
          alert("Debes ver el video completo para reclamar tu energía.")
        }
      } catch (err) {
        console.error("Error al cargar Adsgram:", err)
        setEnergy(MAX_ENERGY)
      }
    } else {
      setEnergy(MAX_ENERGY)
    }
  }

  // Lógica de clics en la Arepa
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (energy < TAP_COST) return
    playCoin()
    setBalance((prev) => prev + TAP_REWARD)
    setEnergy((prev) => Math.max(0, prev - TAP_COST))
    setPopping(true)
    if (popTimeout.current) clearTimeout(popTimeout.current)
    popTimeout.current = setTimeout(() => setPopping(false), 100)

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = floatId.current++
    setFloats((prev) => [...prev, { id, x, y, score: TAP_REWARD }])
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id))
    }, 1000)
  }

  // Recarga automática de energía (+3 por segundo)
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(MAX_ENERGY, prev + RECHARGE_PER_SECOND))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground select-none max-w-md mx-auto relative overflow-hidden font-sans pb-16">
      {/* Encabezado e Interfaz Principal */}
      <div className="flex items-center justify-between p-4 border-b shrink-0 bg-card/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <DailyRewardButton streak={streak} nextClaimAt={nextClaimAt} onClaim={() => {}} />
          <RankingButton onClick={() => setShowRanking(true)} />
        </div>
        <WalletButton wallet={wallet} onClick={() => setShowWallet(true)} />
      </div>

      {/* Contenido Dinámico de las Pestañas */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {tab === "tap" && (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Balance Actual</p>
              <h1 className="text-5xl font-black text-primary tracking-tight tabular-nums flex items-center justify-center gap-2">
                🪙 {balance.toLocaleString("es")} <span className="text-xs font-bold text-muted-foreground">$AREPA</span>
              </h1>
            </div>

            {/* Moneda / Arepa Gigante para Tocar */}
            <div className="relative w-72 h-72 flex items-center justify-center">
              <div
                onClick={handleTap}
                className={`relative w-64 h-64 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 shadow-2xl flex items-center justify-center cursor-pointer transform active:scale-95 transition-all duration-75 border-4 border-amber-600/30 overflow-hidden ${
                  popping ? "scale-98 brightness-110" : ""
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
                <span className="text-8xl select-none filter drop-shadow-md">🫓</span>
              </div>
              {floats.map((f) => (
                <span
                  key={f.id}
                  className="absolute pointer-events-none text-2xl font-black text-amber-300 animate-float drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  style={{ left: f.x, top: f.y }}
                >
                  +{f.score}
                </span>
              ))}
            </div>

            {/* Barra de Energía y BOTÓN DE ANUNCIOS */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-1">⚡ Energía</span>
                <span className="tabular-nums">{energy} / {MAX_ENERGY}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-200" style={{ width: `${(energy / MAX_ENERGY) * 100}%` }} />
              </div>

              {/* 📺 NUEVO BOTÓN DE ADSGRAM */}
              <button 
                onClick={mostrarVideoRecompensa}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg active:scale-98 transition-transform flex items-center justify-center gap-2"
              >
                🎬 Ver Video para Recargar Energía (Gratis)
              </button>
            </div>
          </div>
        )}

        {tab === "referidos" && <ReferidosView friends={friends} />}
        {tab === "ruleta" && <RuletaView />}
        {tab === "mineria" && <MineriaView balance={balance} owned={owned} />}
        {tab === "tareas" && <SocialTasks completedTasks={completedTasks} />}
      </div>

      <BottomNav active={tab} onChange={(setTab)} />
      <WalletModal open={showWallet} wallet={wallet} onClose={() => setShowWallet(false)} />
      <LeaderboardModal open={showRanking} onClose={() => setShowRanking(false)} />
    </div>
  )
}
