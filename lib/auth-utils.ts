/**
 * Utilidades para autenticación y manejo de roles
 */

import { createBrowserClient, executeWithRetry } from "./supabase-client"
import type { User } from "@supabase/supabase-js"

/**
 * Verifica si un usuario tiene rol de administrador
 * @param user Usuario a verificar
 * @returns Promise<boolean> true si el usuario es administrador
 */
export async function isUserAdmin(user: User | null): Promise<boolean> {
  if (!user) return false

  try {
    return await executeWithRetry(
      async () => {
        const supabase = createBrowserClient()

        // Verificar en la tabla de perfiles
        const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (error) {
          console.error("Error al verificar rol de administrador:", error)
          return false
        }

        return data?.role === "admin"
      },
      3,
      1000,
      "Verificar rol de administrador",
    )
  } catch (error) {
    console.error("Error al verificar rol de administrador:", error)
    return false
  }
}

/**
 * Verifica si el usuario actual tiene rol de administrador
 * @returns Promise<boolean> true si el usuario actual es administrador
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = createBrowserClient()

    return await executeWithRetry(
      async () => {
        // Obtener usuario actual
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          console.error("Error al obtener usuario actual:", error)
          return false
        }

        return isUserAdmin(user)
      },
      3,
      1000,
      "Verificar si usuario actual es administrador",
    )
  } catch (error) {
    console.error("Error al verificar si usuario actual es administrador:", error)
    return false
  }
}

/**
 * Obtiene el perfil completo del usuario
 * @param userId ID del usuario
 * @returns Perfil del usuario o null si no existe
 */
export async function getUserProfile(userId: string) {
  try {
    const supabase = createBrowserClient()

    return await executeWithRetry(
      async () => {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

        if (error) {
          console.error("Error al obtener perfil de usuario:", error)
          return null
        }

        return data
      },
      3,
      1000,
      "Obtener perfil de usuario",
    )
  } catch (error) {
    console.error("Error al obtener perfil de usuario:", error)
    return null
  }
}

