"use client"

import { cn } from "@/lib/utils"

export type TabId = "tap" | "referidos" | "juegos" | "mineria" | "vip"

const TABS: { id: TabId; label: string; icon: string; color: string }[] = [
  { id: "tap", label: "Tap", icon: "🎮", color: "var(--chart-1)" },
  { id: "referidos", label: "Referidos", icon: "👥", color: "var(--chart-3)" },
  { id: "juegos", label: "Juegos", icon: "🕹️", color: "var(--chart-5)" },
  { id: "mineria", label: "Minería", icon: "⛏️", color: "var(--chart-4)" },
  { id: "vip", label: "Tienda VIP", icon: "👑", color: "var(--chart-2)" },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: TabId
  onChange: (id: TabId) => void
}) {
  return (
    <nav
      aria-label="Navegación principal"
      className="mx-auto grid w-full max-w-md grid-cols-5 gap-1 rounded-3xl border border-border bg-card/80 p-2 backdrop-blur-md"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 transition-all duration-200 active:scale-95",
              isActive
                ? "text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground",
            )}
            style={isActive ? { backgroundColor: tab.color } : undefined}
          >
            <span className="text-xl leading-none" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="text-[11px] font-semibold leading-none">
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
