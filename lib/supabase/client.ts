"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Cliente de Supabase para el navegador.
 *
 * Las credenciales llegan por variables de entorno cuando conectas la
 * integración oficial de Supabase (NEXT_PUBLIC_SUPABASE_URL y
 * NEXT_PUBLIC_SUPABASE_ANON_KEY). Si todavía no está conectado, el cliente
 * es null y toda la lógica de datos hace "fallback" a local para que el
 * juego siga funcionando sin errores.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let browserClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null
  if (browserClient) return browserClient
  browserClient = createClient(url, anonKey, {
    auth: { persistSession: false },
  })
  return browserClient
}

/** true cuando la integración de Supabase ya está configurada. */
export const isSupabaseConfigured = Boolean(url && anonKey)
