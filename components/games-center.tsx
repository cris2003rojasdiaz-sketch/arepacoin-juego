"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const DAY_MS = 24 * 60 * 60 * 1000
const fmt = (n: number) => Math.floor(n).toLocaleString("es")

type GameId = "ruleta" | "memoria" | "raspa" | "ppt"

const GAMES: { id: GameId; name: string; emoji: string; desc: string; color: string }[] = [
  { id: "ruleta", name: "La Ruleta", emoji: "🎡", desc: "Giro diario de la suerte", color: "var(--chart-5)" },
  { id: "memoria", name: "Memoria", emoji: "🧠", desc: "Encuentra las parejas", color: "var(--chart-4)" },
  { id: "raspa", name: "Raspa y Gana", emoji: "🎫", desc: "Raspa y descubre tu premio", color: "var(--chart-3)" },
  { id: "ppt", name: "Piedra, Papel o Tijera", emoji: "✊", desc: "Apuesta contra la IA", color: "var(--chart-2)" },
]

/* ============================ Vista principal ============================= */

export function JuegosView({
  balance,
  onReward,
}: {
  balance: number
  onReward: (delta: number) => void
}) {
  const [open, setOpen] = useState<GameId | null>(null)

  if (open) {
    return (
      <div className="mx-auto w-full max-w-sm">
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="mb-3 flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-sm font-semibold text-foreground transition-transform active:scale-95"
        >
          <span aria-hidden="true">‹</span> Volver a juegos
        </button>
        {open === "ruleta" && <RuletaGame onReward={onReward} />}
        {open === "memoria" && <MemoriaGame onReward={onReward} />}
        {open === "raspa" && <RaspaGame onReward={onReward} />}
        {open === "ppt" && <PptGame balance={balance} onReward={onReward} />}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-3xl shadow-inner">
          <span aria-hidden="true">🎮</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Centro de Juegos</h2>
        <p className="mx-auto mt-1 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
          Juega y suma $AREPA a tu balance. ¡Nuevos retos cada día!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setOpen(g.id)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-transform active:scale-95"
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
              style={{ backgroundColor: g.color }}
              aria-hidden="true"
            >
              {g.emoji}
            </span>
            <span className="text-sm font-bold leading-tight text-foreground text-balance">
              {g.name}
            </span>
            <span className="text-[11px] leading-tight text-muted-foreground text-pretty">
              {g.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------- Ruleta ---------------------------------- */

const WHEEL_PRIZES = [100, 500, 1000, 100, 500, 1000, 250, 750]

function RuletaGame({ onReward }: { onReward: (delta: number) => void }) {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<number | null>(null)
  const [nextSpinAt, setNextSpinAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!nextSpinAt) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [nextSpinAt])

  const locked = nextSpinAt !== null && now < nextSpinAt
  const remaining = nextSpinAt ? nextSpinAt - now : 0

  const spin = useCallback(() => {
    if (spinning || locked) return
    setSpinning(true)
    setResult(null)
    const index = Math.floor(Math.random() * WHEEL_PRIZES.length)
    const segAngle = 360 / WHEEL_PRIZES.length
    const target = 360 * 6 + (360 - index * segAngle - segAngle / 2)
    setRotation((prev) => prev + target)
    setTimeout(() => {
      const prize = WHEEL_PRIZES[index]
      setResult(prize)
      onReward(prize)
      setSpinning(false)
      setNextSpinAt(Date.now() + DAY_MS)
    }, 4200)
  }, [spinning, locked, onReward])

  const gradient = useMemo(() => {
    const seg = 360 / WHEEL_PRIZES.length
    const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
    const stops = WHEEL_PRIZES.map((_, i) => {
      const c = colors[i % colors.length]
      return `${c} ${i * seg}deg ${(i + 1) * seg}deg`
    })
    return `conic-gradient(${stops.join(",")})`
  }, [])

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-1 text-lg font-bold text-foreground">La Ruleta</h3>
      <p className="mb-4 text-center text-xs text-muted-foreground">
        Un giro cada 24 horas. Premios de +100 a +1.000 $AREPA.
      </p>

      <div className="relative mb-5 flex items-center justify-center">
        <span
          className="absolute -top-1 z-10 text-2xl drop-shadow"
          aria-hidden="true"
        >
          🔻
        </span>
        <div
          className="h-56 w-56 rounded-full border-4 border-primary shadow-xl"
          style={{
            background: gradient,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)" : "none",
          }}
        />
        <div className="absolute flex h-14 w-14 items-center justify-center rounded-full border-4 border-primary bg-card text-2xl">
          <span aria-hidden="true">🌽</span>
        </div>
      </div>

      {result !== null && !spinning && (
        <p className="mb-3 text-center text-sm font-bold text-primary">
          ¡Ganaste +{fmt(result)} $AREPA! 🎉
        </p>
      )}

      <button
        type="button"
        onClick={spin}
        disabled={spinning || locked}
        className="w-full rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-95 disabled:opacity-60"
      >
        {spinning
          ? "Girando…"
          : locked
            ? `Próximo giro en ${formatHms(remaining)}`
            : "¡Girar la ruleta!"}
      </button>
    </div>
  )
}

/* ------------------------------- Memoria ---------------------------------- */

const INGREDIENTS = ["🌽", "🧀", "🥑", "🍗", "🫘", "🥓", "🍅", "🧈"]
const MEMORY_TIME = 45
const MEMORY_REWARD = 500

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean }

function buildDeck(): Card[] {
  const pairs = [...INGREDIENTS, ...INGREDIENTS]
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return pairs.map((emoji, id) => ({ id, emoji, flipped: false, matched: false }))
}

function MemoriaGame({ onReward }: { onReward: (delta: number) => void }) {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck())
  const [selected, setSelected] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(MEMORY_TIME)
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing")
  const lockRef = useRef(false)

  useEffect(() => {
    if (status !== "playing") return
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t)
          setStatus("lost")
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [status])

  const handleFlip = useCallback(
    (index: number) => {
      if (lockRef.current || status !== "playing") return
      setDeck((prev) => {
        const card = prev[index]
        if (card.flipped || card.matched) return prev
        return prev.map((c, i) => (i === index ? { ...c, flipped: true } : c))
      })
      setSelected((prev) => [...prev, index])
    },
    [status],
  )

  useEffect(() => {
    if (selected.length !== 2) return
    lockRef.current = true
    const [a, b] = selected
    const match = deck[a].emoji === deck[b].emoji
    const timeout = setTimeout(() => {
      setDeck((prev) =>
        prev.map((c, i) =>
          i === a || i === b
            ? match
              ? { ...c, matched: true, flipped: true }
              : { ...c, flipped: false }
            : c,
        ),
      )
      setSelected([])
      lockRef.current = false
    }, 700)
    return () => clearTimeout(timeout)
  }, [selected, deck])

  useEffect(() => {
    if (status === "playing" && deck.length > 0 && deck.every((c) => c.matched)) {
      setStatus("won")
      onReward(MEMORY_REWARD)
    }
  }, [deck, status, onReward])

  const reset = useCallback(() => {
    setDeck(buildDeck())
    setSelected([])
    setTimeLeft(MEMORY_TIME)
    setStatus("playing")
    lockRef.current = false
  }, [])

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-1 text-lg font-bold text-foreground">Memoria de Ingredientes</h3>
      <p className="mb-3 text-center text-xs text-muted-foreground">
        Encuentra las 8 parejas antes de que se acabe el tiempo. Premio: +{fmt(MEMORY_REWARD)} $AREPA.
      </p>

      <div className="mb-3 flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-2 text-sm font-bold">
        <span className="text-foreground">⏱ {timeLeft}s</span>
        <span className="text-primary">
          {deck.filter((c) => c.matched).length / 2} / 8 parejas
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {deck.map((card, i) => {
          const shown = card.flipped || card.matched
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(i)}
              disabled={shown || status !== "playing"}
              aria-label={shown ? `Carta ${card.emoji}` : "Carta oculta"}
              className={`flex h-16 w-16 items-center justify-center rounded-xl border text-2xl transition-all ${
                shown
                  ? "border-primary bg-primary/15"
                  : "border-border bg-card active:scale-95"
              } ${card.matched ? "opacity-60" : ""}`}
            >
              <span aria-hidden="true">{shown ? card.emoji : "❓"}</span>
            </button>
          )
        })}
      </div>

      {status !== "playing" && (
        <div className="mt-4 w-full text-center">
          <p className={`mb-2 text-sm font-bold ${status === "won" ? "text-primary" : "text-destructive"}`}>
            {status === "won" ? `¡Ganaste +${fmt(MEMORY_REWARD)} $AREPA! 🎉` : "¡Se acabó el tiempo!"}
          </p>
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-95"
          >
            Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Raspa y Gana ------------------------------ */

const SCRATCH_PRIZES = [50, 100, 200, 500, 1000]

function RaspaGame({ onReward }: { onReward: (delta: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [prize] = useStateLazyPrize()
  const [revealed, setRevealed] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const drawing = useRef(false)

  const setupCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#8a8a8a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = "bold 20px sans-serif"
    ctx.fillStyle = "#eee"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Raspa aquí 👆", canvas.width / 2, canvas.height / 2)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) setupCanvas(canvas)
  }, [setupCanvas])

  const scratchAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()
  }, [])

  const checkReveal = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let clear = 0
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) clear++
    }
    const pct = clear / (data.length / 4)
    if (pct > 0.5 && !revealed) {
      setRevealed(true)
      onReward(prize)
    }
  }, [revealed, onReward, prize])

  const handleDown = (e: React.PointerEvent) => {
    if (revealed) return
    drawing.current = true
    scratchAt(e.clientX, e.clientY)
  }
  const handleMove = (e: React.PointerEvent) => {
    if (!drawing.current || revealed) return
    scratchAt(e.clientX, e.clientY)
  }
  const handleUp = () => {
    if (revealed) return
    drawing.current = false
    checkReveal()
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-1 text-lg font-bold text-foreground">Raspa y Gana</h3>
      <p className="mb-4 text-center text-xs text-muted-foreground">
        Raspa la tarjeta con el dedo para descubrir tu premio en $AREPA.
      </p>

      <div className="relative h-44 w-full max-w-xs overflow-hidden rounded-2xl border border-border">
        {/* Premio debajo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/15">
          <span className="text-4xl" aria-hidden="true">🎉</span>
          <p className="mt-1 text-2xl font-extrabold text-primary">+{fmt(prize)}</p>
          <p className="text-xs font-semibold text-foreground">$AREPA</p>
        </div>
        {/* Capa gris raspable */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={320}
            height={176}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerLeave={handleUp}
            className="absolute inset-0 h-full w-full cursor-pointer touch-none"
          />
        )}
      </div>

      {revealed && !claimed && (
        <button
          type="button"
          onClick={() => setClaimed(true)}
          className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-95"
        >
          ¡Reclamado! +{fmt(prize)} $AREPA
        </button>
      )}
      {revealed && claimed && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Vuelve pronto para otra tarjeta.
        </p>
      )}
    </div>
  )
}

// Elige el premio una sola vez por montaje del juego.
function useStateLazyPrize(): [number] {
  const [prize] = useState(() => SCRATCH_PRIZES[Math.floor(Math.random() * SCRATCH_PRIZES.length)])
  return [prize]
}

/* --------------------------- Piedra Papel Tijera -------------------------- */

const MOVES = [
  { id: "piedra", emoji: "✊", label: "Piedra" },
  { id: "papel", emoji: "✋", label: "Papel" },
  { id: "tijera", emoji: "✌️", label: "Tijera" },
] as const

type MoveId = (typeof MOVES)[number]["id"]
const BET_OPTIONS = [100, 250, 500]

function beats(a: MoveId, b: MoveId): boolean {
  return (
    (a === "piedra" && b === "tijera") ||
    (a === "papel" && b === "piedra") ||
    (a === "tijera" && b === "papel")
  )
}

function PptGame({
  balance,
  onReward,
}: {
  balance: number
  onReward: (delta: number) => void
}) {
  const [bet, setBet] = useState(BET_OPTIONS[0])
  const [playerMove, setPlayerMove] = useState<MoveId | null>(null)
  const [aiMove, setAiMove] = useState<MoveId | null>(null)
  const [outcome, setOutcome] = useState<"win" | "lose" | "tie" | null>(null)
  const [playing, setPlaying] = useState(false)

  const play = useCallback(
    (move: MoveId) => {
      if (playing) return
      if (balance < bet) return
      setPlaying(true)
      setPlayerMove(move)
      setAiMove(null)
      setOutcome(null)

      const ai = MOVES[Math.floor(Math.random() * MOVES.length)].id
      setTimeout(() => {
        setAiMove(ai)
        if (move === ai) {
          setOutcome("tie") // sin cambios en balance
        } else if (beats(move, ai)) {
          setOutcome("win")
          onReward(bet) // gana el doble: recupera + gana la apuesta
        } else {
          setOutcome("lose")
          onReward(-bet)
        }
        setPlaying(false)
      }, 700)
    },
    [playing, balance, bet, onReward],
  )

  const canPlay = balance >= bet

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-1 text-lg font-bold text-foreground">Piedra, Papel o Tijera</h3>
      <p className="mb-3 text-center text-xs text-muted-foreground">
        Apuesta contra la IA. Si ganas, duplicas tu apuesta.
      </p>

      {/* Selector de apuesta */}
      <div className="mb-4 flex w-full gap-2">
        {BET_OPTIONS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBet(b)}
            disabled={playing}
            className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-colors ${
              bet === b
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground"
            }`}
          >
            {fmt(b)}
          </button>
        ))}
      </div>

      {/* Marcador de jugada */}
      <div className="mb-4 flex w-full items-center justify-around rounded-2xl bg-secondary p-4">
        <div className="text-center">
          <p className="mb-1 text-[11px] font-semibold text-muted-foreground">Tú</p>
          <span className="text-4xl" aria-hidden="true">
            {playerMove ? MOVES.find((m) => m.id === playerMove)?.emoji : "❔"}
          </span>
        </div>
        <span className="text-lg font-bold text-muted-foreground">VS</span>
        <div className="text-center">
          <p className="mb-1 text-[11px] font-semibold text-muted-foreground">IA</p>
          <span className="text-4xl" aria-hidden="true">
            {aiMove ? MOVES.find((m) => m.id === aiMove)?.emoji : playing ? "…" : "❔"}
          </span>
        </div>
      </div>

      {outcome && (
        <p
          className={`mb-3 text-sm font-bold ${
            outcome === "win"
              ? "text-primary"
              : outcome === "lose"
                ? "text-destructive"
                : "text-muted-foreground"
          }`}
        >
          {outcome === "win"
            ? `¡Ganaste +${fmt(bet)} $AREPA! 🎉`
            : outcome === "lose"
              ? `Perdiste -${fmt(bet)} $AREPA`
              : "¡Empate! Recuperas tu apuesta"}
        </p>
      )}

      {!canPlay && (
        <p className="mb-2 text-center text-xs text-destructive">
          No tienes suficiente balance para esta apuesta.
        </p>
      )}

      <div className="grid w-full grid-cols-3 gap-2">
        {MOVES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => play(m.id)}
            disabled={playing || !canPlay}
            className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card py-3 transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className="text-3xl" aria-hidden="true">{m.emoji}</span>
            <span className="text-[11px] font-semibold text-foreground">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------- Utilidad -------------------------------- */

function formatHms(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}
