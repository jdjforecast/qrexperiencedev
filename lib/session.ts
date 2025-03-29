import { getBrowserClient, createServerClient } from "./supabase"
import type { User } from "@supabase/supabase-js"

// Cache for the current session to reduce redundant checks
let sessionCache: {
  user: User | null
  timestamp: number
} | null = null

// Time in milliseconds before the cache expires
const CACHE_EXPIRY = 10000 // 10 seconds

// Check if there's an active session
export async function checkSession(): Promise<{ user: User | null; isLoading: boolean }> {
  try {
    // Use cached session if available and not expired
    if (sessionCache && Date.now() - sessionCache.timestamp < CACHE_EXPIRY) {
      return { user: sessionCache.user, isLoading: false }
    }

    const supabase = getBrowserClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error checking session:", error)
      return { user: null, isLoading: false }
    }

    // Update cache
    sessionCache = {
      user: data.session?.user || null,
      timestamp: Date.now(),
    }

    return { user: sessionCache.user, isLoading: false }
  } catch (error) {
    console.error("Error checking session:", error)
    return { user: null, isLoading: false }
  }
}

/**
 * Obtiene el usuario actual
 * @returns Usuario actual o null si no hay sesión activa
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Utilizar la función de caché existente
    const { user } = await checkSession()
    return user
  } catch (error) {
    console.error("Error obteniendo usuario actual:", error)
    return null
  }
}

/**
 * Obtiene el usuario actual desde el servidor
 * @returns Usuario actual o null si no hay sesión activa
 */
export async function getCurrentUserServer(): Promise<User | null> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error obteniendo sesión del servidor:", error)
      return null
    }

    return data.session?.user || null
  } catch (error) {
    console.error("Error inesperado obteniendo usuario en servidor:", error)
    return null
  }
}

// Check if the user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const { user } = await checkSession()
  return !!user
}

// Check if the user is an admin
export async function isUserAdmin(): Promise<boolean> {
  const { user } = await checkSession()

  if (!user) return false

  try {
    const supabase = getBrowserClient()
    const { data, error } = await supabase.from("users").select("is_admin").eq("id", user.id).single()

    if (error) {
      console.error("Error checking admin status:", error)
      return false
    }

    return !!data?.is_admin
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Clear session cache (useful for logout)
export function clearSessionCache(): void {
  sessionCache = null
}

