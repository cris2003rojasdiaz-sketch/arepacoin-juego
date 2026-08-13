"use client"

import Image from "next/image"
import { useState } from "react"

const fmt = (n: number) => Math.floor(n).toLocaleString("es")

/* =============================== Pase VIP ================================= */

export const VIP_BONUS = 100_000

export type VipPlan = {
  id: string
  label: string
  days: number
  price: string
  popular?: boolean
}

export const VIP_PLANS: VipPlan[] = [
  { id: "week", label: "7 días", days: 7, price: "4.99 USDT" },
  { id: "month", label: "30 días", days: 30, price: "14.99 USDT", popular: true },
  { id: "quarter", label: "90 días", days: 90, price: "39.99 USDT" },
  { id: "year", label: "1 año", days: 365, price: "99.99 USDT" },
]

const VIP_BENEFITS = [
  { icon: "🔥", text: "Multiplicador x2 permanente en tus toques" },
  { icon: "⚡", text: "Recarga de energía ultra rápida (+10 pts/seg)" },
  { icon: "🎁", text: `Bono inmediato de +${fmt(VIP_BONUS)} ArepaCoins` },
  { icon: "⛏️", text: "Acceso exclusivo a minas de cocina de alto nivel" },
]

/** Insignia de perfil VIP que se muestra en la cabecera. */
export function VipBadge({
  isVip,
  onClick,
}: {
  isVip: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isVip ? "Perfil VIP activo" : "Ver Pase Arepero Premium"}
      className={
        isVip
          ? "flex items-center gap-1.5 rounded-full border border-primary bg-gradient-to-r from-primary to-accent px-3 py-2 text-xs font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-95"
          : "flex items-center gap-1.5 rounded-full border border-primary/40 bg-card/80 px-3 py-2 text-xs font-bold text-primary shadow-sm backdrop-blur-md transition-transform active:scale-95"
      }
    >
      <span aria-hidden="true">{isVip ? "⭐" : "👑"}</span>
      <span>{isVip ? "VIP" : "Premium"}</span>
    </button>
  )
}

/** Banner de llamada a la acción para abrir el Pase Premium. */
export function VipBanner({
  isVip,
  onClick,
}: {
  isVip: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        isVip
          ? "flex w-full items-center gap-3 rounded-2xl border border-primary/50 bg-gradient-to-r from-primary/20 to-accent/20 p-3 text-left shadow-lg transition-transform active:scale-[0.98]"
          : "flex w-full items-center gap-3 rounded-2xl border border-primary/50 bg-gradient-to-r from-primary/25 to-accent/25 p-3 text-left shadow-lg transition-transform active:scale-[0.98]"
      }
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl text-primary-foreground"
        aria-hidden="true"
      >
        {isVip ? "⭐" : "👑"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">
          {isVip ? "Pase Arepero Premium activo" : "Pase Arepero Premium"}
        </p>
        <p className="text-xs font-medium text-primary">
          {isVip
            ? "Beneficios VIP desbloqueados ⭐"
            : "x2 toques · energía turbo · bono +100K"}
        </p>
      </div>
      {!isVip && (
        <span className="shrink-0 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
          Ver
        </span>
      )}
    </button>
  )
}

/** Modal del Pase Arepero Premium con planes y beneficios. */
export function VipModal({
  open,
  isVip,
  onActivate,
  onClose,
}: {
  open: boolean
  isVip: boolean
  onActivate: (plan: VipPlan) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<string>("month")
  if (!open) return null

  const plan = VIP_PLANS.find((p) => p.id === selected) ?? VIP_PLANS[1]

  return (
    <ModalShell title="👑 Pase Arepero Premium" onClose={onClose}>
      {isVip ? (
        <div className="rounded-2xl border border-primary/50 bg-gradient-to-r from-primary/20 to-accent/20 p-4 text-center">
          <p className="text-4xl" aria-hidden="true">
            ⭐
          </p>
          <p className="mt-2 text-base font-extrabold text-foreground">
            ¡Ya eres VIP!
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Todos los beneficios premium están activos en tu cuenta.
          </p>
        </div>
      ) : (
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Activa el pase y desbloquea beneficios que se aplican
          automáticamente a tu cuenta.
        </p>
      )}

      {/* Beneficios destacados */}
      <div className="mt-1 flex flex-col gap-2">
        {VIP_BENEFITS.map((b) => (
          <div
            key={b.text}
            className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-3"
          >
            <span className="text-xl" aria-hidden="true">
              {b.icon}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {b.text}
            </span>
          </div>
        ))}
      </div>

      {!isVip && (
        <>
          {/* Selección de plan */}
          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Elige tu plan
          </p>
          <div className="grid grid-cols-2 gap-2">
            {VIP_PLANS.map((p) => {
              const active = p.id === selected
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className={
                    active
                      ? "relative rounded-2xl border-2 border-primary bg-primary/15 p-3 text-left"
                      : "relative rounded-2xl border border-border bg-card p-3 text-left"
                  }
                >
                  {p.popular && (
                    <span className="absolute -top-2 right-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                      Popular
                    </span>
                  )}
                  <p className="text-sm font-bold text-foreground">{p.label}</p>
                  <p className="text-xs font-medium text-primary">{p.price}</p>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => onActivate(plan)}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-95"
          >
            Activar Pase · {plan.price}
          </button>
        </>
      )}
    </ModalShell>
  )
}

/* ================================== NFTs ================================== */

export type Nft = {
  id: string
  name: string
  rarity: string
  image: string
  priceUsdt: string
  priceSol: string
  accent: string
}

export const NFTS: Nft[] = [
  {
    id: "cyberpunk",
    name: "Arepa Cyberpunk",
    rarity: "Épica",
    image: "/nft-cyberpunk.png",
    priceUsdt: "25 USDT",
    priceSol: "0.15 SOL",
    accent: "var(--chart-5)",
  },
  {
    id: "oro",
    name: "Arepa Sifrina de Oro",
    rarity: "Legendaria",
    image: "/nft-oro.png",
    priceUsdt: "80 USDT",
    priceSol: "0.48 SOL",
    accent: "var(--chart-1)",
  },
  {
    id: "galactica",
    name: "Arepa Llanera Galáctica",
    rarity: "Mítica",
    image: "/nft-galactica.png",
    priceUsdt: "150 USDT",
    priceSol: "0.90 SOL",
    accent: "var(--chart-4)",
  },
]

type PayMethod = "cripto" | "movil"

/** Galería de NFTs coleccionables de preventa. */
export function NftView({
  ownedNfts,
  onBuy,
}: {
  ownedNfts: Record<string, boolean>
  onBuy: (nft: Nft) => void
}) {
  const [method, setMethod] = useState<PayMethod>("cripto")
  const ownsAny = Object.values(ownedNfts).some(Boolean)

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-3xl shadow-inner">
          <span aria-hidden="true">🖼️</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">NFTs Coleccionables</h2>
        <p className="mx-auto mt-1 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
          Arepas raras de edición limitada. Cada NFT otorga{" "}
          <span className="font-bold text-primary">+50% de producción</span> en
          tu minería pasiva.
        </p>
      </div>

      {/* Selector de método de pago */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card/60 p-1.5">
        <button
          type="button"
          onClick={() => setMethod("cripto")}
          className={
            method === "cripto"
              ? "rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground"
              : "rounded-xl py-2 text-xs font-semibold text-muted-foreground"
          }
        >
          💳 USDT / Solana
        </button>
        <button
          type="button"
          onClick={() => setMethod("movil")}
          className={
            method === "movil"
              ? "rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground"
              : "rounded-xl py-2 text-xs font-semibold text-muted-foreground"
          }
        >
          📱 Pago Móvil
        </button>
      </div>

      {ownsAny && (
        <div className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 p-3 text-sm font-bold text-primary">
          <span aria-hidden="true">⚡</span> Bonus NFT activo: +50% minería
        </div>
      )}

      <div className="flex flex-col gap-4">
        {NFTS.map((nft) => {
          const owned = ownedNfts[nft.id]
          return (
            <div
              key={nft.id}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.name}
                  fill
                  sizes="(max-width: 420px) 100vw, 360px"
                  className="object-cover"
                />
                <span
                  className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-primary-foreground shadow"
                  style={{ backgroundColor: nft.accent }}
                >
                  {nft.rarity}
                </span>
                {owned && (
                  <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-extrabold text-primary-foreground shadow">
                    ✓ En posesión
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-foreground">
                  {nft.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-primary">
                  +50% producción pasiva
                </p>
                <button
                  type="button"
                  onClick={() => onBuy(nft)}
                  disabled={owned}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:from-secondary disabled:to-secondary disabled:text-muted-foreground disabled:shadow-none"
                >
                  {owned
                    ? "NFT adquirido ✓"
                    : `Adquirir NFT de Preventa · ${
                        method === "cripto" ? nft.priceUsdt : "Pago Móvil"
                      }`}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
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
        className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-3xl border border-border bg-background p-5 shadow-2xl"
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
