"use client"

import { useEffect, useRef, useState } from "react"
import { submitPaymentReference } from "@/lib/game-data"
import { getGameUser } from "@/lib/telegram"

const VIP_PRICE_USD = 2.99

// Datos de ejemplo de Pago Móvil (Venezuela).
const PAGO_MOVIL = {
  banco: "Banco de Venezuela",
  cedula: "30.034.235",
  telefono: "0416-1357850",
}

const BENEFITS = [
  { emoji: "⚡", text: "Multiplicador de clics x2" },
  { emoji: "🍳", text: "Mejoras de cocina 20% más baratas" },
  { emoji: "⭐", text: "Acceso prioritario a novedades" },
]

export function VipStoreView({
  isVip,
  onActivateVip,
}: {
  isVip: boolean
  onActivateVip: () => void
}) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-3xl shadow-inner">
          <span aria-hidden="true">👑</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Tienda VIP</h2>
        <p className="mx-auto mt-1 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
          Impulsa tu producción de $AREPA con el Pase VIP.
        </p>
      </div>

      {/* Tarjeta del Pase VIP */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-primary bg-gradient-to-b from-primary/20 to-card p-5 shadow-xl">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">👑</span>
          <h3 className="text-xl font-extrabold text-foreground">Pase VIP ArepaCoin</h3>
        </div>
        <p className="mb-4 text-xs font-semibold text-primary">
          {isVip ? "¡Ya eres miembro VIP! 🎉" : "Membresía premium del juego"}
        </p>

        <ul className="mb-5 flex flex-col gap-2.5">
          {BENEFITS.map((b) => (
            <li key={b.text} className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-base"
                aria-hidden="true"
              >
                {b.emoji}
              </span>
              <span className="text-sm font-medium text-foreground">{b.text}</span>
            </li>
          ))}
        </ul>

        <div className="mb-4 flex items-end justify-between rounded-2xl bg-card/70 px-4 py-3">
          <div>
            <p className="text-2xl font-extrabold text-foreground">${VIP_PRICE_USD} USD</p>
            <p className="text-[11px] text-muted-foreground">Al cambio en Pago Móvil</p>
          </div>
          <span className="text-3xl" aria-hidden="true">💳</span>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          disabled={isVip}
          className="w-full rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-95 disabled:opacity-60"
        >
          {isVip ? "Pase VIP activo ✓" : "Comprar con Pago Móvil"}
        </button>
      </div>

      <PagoMovilModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirmed={() => {
          setModalOpen(false)
          onActivateVip()
        }}
      />
    </div>
  )
}

/* ------------------------------ Modal de pago ----------------------------- */

function PagoMovilModal({
  open,
  onClose,
  onConfirmed,
}: {
  open: boolean
  onClose: () => void
  onConfirmed: () => void
}) {
  const [reference, setReference] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) {
      setReference("")
      setError("")
      setSubmitting(false)
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current)
    }
  }, [])

  if (!open) return null

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Ignorar si el portapapeles está bloqueado.
    }
    setCopied(key)
    if (copyTimeout.current) clearTimeout(copyTimeout.current)
    copyTimeout.current = setTimeout(() => setCopied(null), 1500)
  }

  const handleConfirm = async () => {
    const ref = reference.trim()
    if (ref.length < 4) {
      setError("Ingresa un número de referencia válido.")
      return
    }
    setSubmitting(true)
    const user = getGameUser()
    const ok = await submitPaymentReference({
      telegramId: user.telegramId,
      username: user.username,
      reference: ref,
      amountUsd: VIP_PRICE_USD,
      concept: "Pase VIP ArepaCoin",
    })
    setSubmitting(false)
    if (!ok) {
      setError("No se pudo registrar el pago. Intenta de nuevo.")
      return
    }
    onConfirmed()
  }

  const rows: { label: string; value: string; key: string }[] = [
    { label: "Banco", value: PAGO_MOVIL.banco, key: "banco" },
    { label: "Cédula", value: PAGO_MOVIL.cedula, key: "cedula" },
    { label: "Teléfono", value: PAGO_MOVIL.telefono, key: "telefono" },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Datos de Pago Móvil"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Pago Móvil</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">
          Realiza el Pago Móvil por el equivalente a ${VIP_PRICE_USD} USD a estos datos y
          pega tu número de referencia abajo:
        </p>

        <div className="mb-4 flex flex-col gap-2 rounded-2xl bg-secondary p-3">
          {rows.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => copy(r.value, r.key)}
              className="flex items-center justify-between rounded-xl px-2 py-1.5 text-left transition-colors active:bg-background/50"
            >
              <span className="text-xs font-semibold text-muted-foreground">{r.label}</span>
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                {r.value}
                <span className="text-[10px] text-primary">
                  {copied === r.key ? "¡Copiado!" : "Copiar"}
                </span>
              </span>
            </button>
          ))}
        </div>

        <label className="mb-1.5 block text-xs font-semibold text-foreground">
          Número de Referencia <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={reference}
          onChange={(e) => {
            setReference(e.target.value)
            if (error) setError("")
          }}
          placeholder="Ej: 001234567"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
        />
        {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="mt-4 w-full rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-lg transition-transform active:scale-95 disabled:opacity-60"
        >
          {submitting ? "Registrando…" : "Confirmar pago"}
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Verificaremos tu referencia y activaremos tu Pase VIP.
        </p>
      </div>
    </div>
  )
}
