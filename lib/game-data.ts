"use client"

import { getSupabase } from "@/lib/supabase/client"
import { getGameUser } from "@/lib/telegram"

/**
 * Capa de datos del juego.
 *
 * Cuando Supabase está conectado, lee/escribe en las tablas `usuarios` y
 * `pagos_pendientes`. Cuando no lo está, persiste en localStorage para que
 * el progreso no se pierda durante las pruebas. La API pública es la misma
 * en ambos casos, así que la UI no necesita saber cuál está activo.
 */

export type GameProfile = {
  telegramId: string
  username: string
  balance: number
  isVip: boolean
}

const LS_PREFIX = "arepacoin_profile_"

function localKey(id: string) {
  return `${LS_PREFIX}${id}`
}

function readLocal(id: string): Partial<GameProfile> | null {
  try {
    const raw = window.localStorage.getItem(localKey(id))
    return raw ? (JSON.parse(raw) as Partial<GameProfile>) : null
  } catch {
    return null
  }
}

function writeLocal(profile: GameProfile) {
  try {
    window.localStorage.setItem(localKey(profile.telegramId), JSON.stringify(profile))
  } catch {
    // Ignorar cuotas/errores de almacenamiento.
  }
}

/**
 * Busca al usuario por su ID de Telegram. Si no existe, lo registra con
 * balance 0 y is_vip=false. Devuelve el perfil resultante.
 */
export async function loadOrCreateProfile(): Promise<GameProfile> {
  const user = getGameUser()
  const base: GameProfile = {
    telegramId: user.telegramId,
    username: user.username,
    balance: 0,
    isVip: false,
  }

  const supabase = getSupabase()

  if (!supabase) {
    // Modo local (Supabase no conectado todavía).
    const local = readLocal(user.telegramId)
    const profile = { ...base, ...local, telegramId: user.telegramId, username: user.username }
    writeLocal(profile)
    return profile
  }

  // Buscar en la tabla `usuarios`.
  const { data, error } = await supabase
    .from("usuarios")
    .select("telegram_id, username, balance, is_vip")
    .eq("telegram_id", user.telegramId)
    .maybeSingle()

  if (error) {
    console.log("[v0] Supabase select error:", error.message)
    return base
  }

  if (data) {
    return {
      telegramId: String(data.telegram_id),
      username: data.username ?? user.username,
      balance: Number(data.balance) || 0,
      isVip: Boolean(data.is_vip),
    }
  }

  // No existe: registrarlo.
  const { error: insertError } = await supabase.from("usuarios").insert({
    telegram_id: user.telegramId,
    username: user.username,
    balance: 0,
    is_vip: false,
  })
  if (insertError) console.log("[v0] Supabase insert error:", insertError.message)
  return base
}

/** Guarda el balance (y opcionalmente el estado VIP) del usuario. */
export async function saveProfile(patch: {
  telegramId: string
  username: string
  balance: number
  isVip: boolean
}): Promise<void> {
  const supabase = getSupabase()

  if (!supabase) {
    writeLocal(patch)
    return
  }

  const { error } = await supabase.from("usuarios").upsert(
    {
      telegram_id: patch.telegramId,
      username: patch.username,
      balance: Math.floor(patch.balance),
      is_vip: patch.isVip,
    },
    { onConflict: "telegram_id" },
  )
  if (error) console.log("[v0] Supabase upsert error:", error.message)
}

/**
 * Registra una referencia de Pago Móvil en la tabla `pagos_pendientes`.
 * Devuelve true si se guardó correctamente.
 */
export async function submitPaymentReference(params: {
  telegramId: string
  username: string
  reference: string
  amountUsd: number
  concept: string
}): Promise<boolean> {
  const supabase = getSupabase()

  if (!supabase) {
    // Sin Supabase: guardamos localmente para no perder el dato.
    try {
      const key = "arepacoin_pagos_pendientes"
      const list = JSON.parse(window.localStorage.getItem(key) || "[]")
      list.push({ ...params, created_at: new Date().toISOString() })
      window.localStorage.setItem(key, JSON.stringify(list))
    } catch {
      // Ignorar.
    }
    return true
  }

  const { error } = await supabase.from("pagos_pendientes").insert({
    telegram_id: params.telegramId,
    username: params.username,
    referencia: params.reference,
    monto_usd: params.amountUsd,
    concepto: params.concept,
    estado: "pendiente",
  })
  if (error) {
    console.log("[v0] Supabase pago insert error:", error.message)
    return false
  }
  return true
}
