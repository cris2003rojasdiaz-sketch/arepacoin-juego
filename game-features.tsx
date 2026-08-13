"use client"

import { useState, useEffect } from "react"

export type SocialTask = {
  id: string
  title: string
  reward: number
  link: string
}

const INITIAL_TASKS: SocialTask[] = [
  {
    id: "tg_canal",
    title: "Seguir Canal de Telegram Oficial",
    reward: 5000,
    link: "https://t.me",
  },
  {
    id: "x_oficial",
    title: "Seguir Cuenta Oficial en X (Twitter)",
    reward: 5000,
    link: "https://x.com",
  },
]

export function SocialTasks({ completedTasks }: { completedTasks: Record<string, boolean> }) {
  const [tasks, setTasks] = useState<SocialTask[]>(INITIAL_TASKS)
  const [localCompleted, setLocalCompleted] = useState<Record<string, boolean>>(completedTasks)
  const [timers, setTimers] = useState<Record<string, number>>({})
  const [verifying, setVerifying] = useState<Record<string, boolean>>({})

  const handleTaskClick = (task: SocialTask) => {
    window.open(task.link, "_blank")

    if (localCompleted[task.id]) return

    if (!timers[task.id] && !verifying[task.id]) {
      setTimers((prev) => ({ ...prev, [task.id]: 10 }))
      setVerifying((prev) => ({ ...prev, [task.id]: true }))
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev }
        let hasChanges = false
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) {
            updated[key] -= 1
            hasChanges = true
          }
        })
        return hasChanges ? updated : prev
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const claimReward = (taskId: string, reward: number) => {
    setLocalCompleted((prev) => ({ ...prev, [taskId]: true }))
    setVerifying((prev) => ({ ...prev, [taskId]: false }))
    alert(`¡Puntos reclamados! Has ganado +${reward.toLocaleString("es")} $AREPA`)
  }

  return (
    <div className="space-y-4 p-2">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Tareas de Redes Sociales</h2>
        <p className="text-sm text-muted-foreground">Completa las tareas culinarias para amasar más $AREPA.</p>
      </div>

      <div className="space-y-3 pt-2">
        {tasks.map((task) => {
          const isDone = localCompleted[task.id]
          const timeLeft = timers[task.id] || 0
          const isChecking = verifying[task.id]

          return (
            <div key={task.id} className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm">
              <div className="space-y-1">
                <p className="font-semibold text-sm">{task.title}</p>
                <p className="text-xs font-bold text-amber-500">🪙 +{task.reward.toLocaleString("es")} $AREPA</p>
              </div>

              {isDone ? (
                <span className="px-3 py-1.5 bg-green-500/10 text-green-500 text-xs font-bold rounded-lg border border-green-500/20">
                  ✓ Hecho
                </span>
              ) : isChecking ? (
                timeLeft > 0 ? (
                  <button disabled className="px-3 py-1.5 bg-secondary text-muted-foreground text-xs font-bold rounded-lg cursor-not-allowed">
                    Verificando ({timeLeft}s)
                  </button>
                ) : (
                  <button onClick={() => claimReward(task.id, task.reward)} className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-black rounded-lg shadow active:scale-95 transition-transform">
                    Reclamar
                  </button>
                )
              ) : (
                <button onClick={() => handleTaskClick(task)} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow active:scale-95 transition-transform">
                  Ir a la Red
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ReferidosView({ friends }: { friends: any[] }) { return <div className="p-4 text-center text-sm text-muted-foreground">Pestaña de Referidos Activa</div> }
export function RuletaView() { return <div className="p-4 text-center text-sm text-muted-foreground">Pestaña de la Ruleta Activa</div> }
export function MineriaView({ balance, owned }: { balance: number, owned: any }) { return <div className="p-4 text-center text-sm text-muted-foreground">Pestaña de Minería (Budare/Molino) Activa</div> }
