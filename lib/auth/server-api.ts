/**
 * Este archivo contiene funciones de autenticación para uso en API Routes
 * y otros contextos que no pueden utilizar next/headers directamente.
 */

import { createServerClientForApi } from "@/lib/supabase/server-api"
import type { User } from "@supabase/supabase-js"

// Define a type for the profile data
interface ProfileData {
  id: string
  role: "customer" | "admin" | string
  full_name?: string
  company_name?: string
  [key: string]: any
}

/**
 * Obtiene el perfil de un usuario (versión API)
 * @param userId ID del usuario
 * @returns Perfil del usuario o null si no existe
 */
export async function getUserProfile(userId: string): Promise<ProfileData | null> {
  let profileToReturn: ProfileData | null = null
  try {
    if (!userId) {
      console.warn("getUserProfile: No se proporcionó userId")
      return null
    }

    const supabase = createServerClientForApi({ admin: true })

    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id, role, full_name, company_name")
      .eq("id", userId)
      .maybeSingle()

    if (checkError) {
      console.error("Error al verificar/obtener el perfil existente:", checkError.message)
      return null
    }

    if (existingProfile) {
      console.log(`Perfil encontrado para el usuario ${userId}`)
      profileToReturn = existingProfile as ProfileData
    } else {
      console.log(`Perfil no encontrado para el usuario ${userId}, creando uno nuevo...`)
      const defaultRole = "customer"
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          role: defaultRole,
        })
        .select("id, role, full_name, company_name")
        .single()

      if (insertError) {
        console.error("Error al crear el perfil del usuario:", insertError.message)
        return null
      }

      if (newProfile) {
        profileToReturn = newProfile as ProfileData
      } else {
        console.error(`Error inesperado: no se pudo obtener el perfil ${userId} después de la inserción.`)
        return null
      }
    }

    return profileToReturn
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error en getUserProfile para ${userId}:`, error.message)
    } else {
      console.error(`Error desconocido en getUserProfile para ${userId}:`, error)
    }
    return null
  }
}

/**
 * Verifica si un usuario es administrador (versión API)
 * @param userId ID del usuario
 * @returns true si el usuario es administrador, false en caso contrario
 */
export async function isUserAdmin(userId: string | undefined | null): Promise<boolean> {
  try {
    if (!userId) return false

    const profile = await getUserProfile(userId)
    return profile?.role === "admin"
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al verificar si el usuario es administrador:", error.message)
    } else {
      console.error("Error desconocido al verificar si el usuario es administrador:", error)
    }
    return false
  }
}

/**
 * Crea un cliente Supabase para el servidor (versión API)
 * Helper para componentes de servidor y API routes
 */
export function createServerClient(options?: { admin?: boolean }) {
  return createServerClientForApi(options)
}

/**
 * Obtiene el usuario actual desde la sesión en la petición (versión API)
 * @param request La petición HTTP con la cookie de sesión
 * @returns El usuario actual o null si no hay sesión
 */
export async function getCurrentUserFromRequest(request: Request): Promise<User | null> {
  try {
    // Extraer cookies de la Request
    const cookieHeader = request.headers.get("cookie") || ""

    // Inicializar Supabase con las cookies de la request
    const supabase = createServerClientForApi()

    // Nota: No podemos establecer cookies manualmente en esta versión
    // En su lugar, dependemos de que las cookies se pasen automáticamente en el cliente

    // Intentar obtener la sesión
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Error al obtener la sesión:", error.message)
      return null
    }

    if (!data.session) {
      return null
    }

    return data.session.user
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al obtener el usuario actual:", error.message)
    } else {
      console.error("Error desconocido al obtener el usuario actual:", error)
    }
    return null
  }
}

