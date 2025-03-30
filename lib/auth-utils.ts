/**
 * Utilidades para autenticación y manejo de roles
 */

import { getBrowserClient } from "@/lib/supabase-client-browser"
import type { User } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Verifica si un usuario tiene rol de administrador
 * @param user Usuario a verificar
 * @returns Promise<boolean> true si el usuario es administrador
 */
export async function isUserAdmin(user: User | null): Promise<boolean> {
  if (!user) return false

  try {
    const supabase = getBrowserClient()
    const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (error) {
      if (error.code === "PGRST116") return false
      console.error("Error al verificar rol de administrador:", error)
      return false
    }
    return data?.role === "admin"
  } catch (error) {
    console.error("Error al verificar rol de administrador:", error)
    return false
  }
}

/**
 * Verifica si el usuario actual (basado en la sesión del navegador) es administrador.
 * @returns Promise<boolean> true si el usuario actual es administrador
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = getBrowserClient()
    // Obtener el usuario de la sesión actual del cliente
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser()

    if (sessionError || !user) {
      console.error("Error getting current user or no user session:", sessionError)
      return false
    }

    // Reutilizar la lógica de isUserAdmin
    return await isUserAdmin(user)
  } catch (error) {
    console.error("Error checking current user admin status:", error)
    return false
  }
}

/**
 * Obtiene el perfil del usuario actual (basado en la sesión del navegador).
 * @returns Promise<any | null> Perfil del usuario o null si hay error o no está logueado.
 */
export async function getCurrentUserProfile(): Promise<any | null> {
  try {
    const supabase = getBrowserClient()
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser()

    if (sessionError || !user) {
      console.error("Error getting current user or no user session:", sessionError)
      return null
    }

    // Obtener perfil usando el ID del usuario de sesión
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) {
      if (error.code === "PGRST116") return null // Profile not found is not an error here
      console.error("Error fetching current user profile:", error)
      return null
    }
    return data
  } catch (error) {
    console.error("Error getting current user profile:", error)
    return null
  }
}

/**
 * Obtiene el perfil de un usuario específico por su ID (llamada desde el cliente).
 * @param userId ID del usuario
 * @returns Promise<any | null> Perfil del usuario o null si hay error.
 */
export async function getUserProfile(userId: string): Promise<any | null> {
  if (!userId) return null
  try {
    const supabase = getBrowserClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      if (error.code === "PGRST116") return null // Profile not found
      console.error(`Error fetching profile for user ${userId}:`, error)
      return null
    }
    return data
  } catch (error) {
    console.error(`Error getting profile for user ${userId}:`, error)
    return null
  }
}

/**
 * Obtiene el usuario actual de la sesión
 * @param supabase Cliente de Supabase (browser o server)
 * @returns Promise<User | null> Usuario actual o null si no hay sesión
 */
export async function getCurrentUser(supabase: SupabaseClient): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error("Error getting current user:", error)
      return null
    }
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

