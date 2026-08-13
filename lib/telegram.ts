"use client"

/**
 * Utilidades para leer datos del usuario dentro de Telegram Mini Apps.
 * Si el juego se abre fuera de Telegram (p. ej. la vista previa web),
 * usamos un ID de invitado estable guardado en localStorage para que
 * la sincronización con Supabase siga funcionando durante las pruebas.
 */

type TelegramUser = {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

type TelegramWebApp = {
  initDataUnsafe?: { user?: TelegramUser }
  ready?: () => void
  expand?: () => void
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

const GUEST_KEY = "arepacoin_guest_id"

export type GameUser = {
  telegramId: string
  username: string
  isTelegram: boolean
}

/** Devuelve el usuario actual: real si estamos en Telegram, invitado si no. */
export function getGameUser(): GameUser {
  if (typeof window === "undefined") {
    return { telegramId: "server", username: "server", isTelegram: false }
  }

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  if (tgUser?.id) {
    return {
      telegramId: String(tgUser.id),
      username: tgUser.username || tgUser.first_name || `user_${tgUser.id}`,
      isTelegram: true,
    }
  }

  // Fuera de Telegram: ID de invitado persistente para pruebas.
  let guest = window.localStorage.getItem(GUEST_KEY)
  if (!guest) {
    guest = `guest_${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem(GUEST_KEY, guest)
  }
  return { telegramId: guest, username: guest, isTelegram: false }
}

/** Indica si el juego corre realmente dentro del contenedor de Telegram. */
export function isInsideTelegram(): boolean {
  return typeof window !== "undefined" && !!window.Telegram?.WebApp?.initDataUnsafe?.user
}

/** Notifica a Telegram que la Mini App está lista y la expande a pantalla completa. */
export function initTelegramApp() {
  if (typeof window === "undefined") return
  const wa = window.Telegram?.WebApp
  wa?.ready?.()
  wa?.expand?.()
}
