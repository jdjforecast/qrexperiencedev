/**
 * Este archivo contiene funciones de autenticación destinadas ÚNICAMENTE para uso en el servidor,
 * especialmente en API Routes y Server Components.
 */

import { createServerClient as createServerClientFromLib } from "@/lib/supabase/server"
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
 * Obtiene el usuario actual desde el servidor
 * @returns El usuario actual o null si no hay sesión
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerClientFromLib()
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

/**
 * Obtiene el perfil de un usuario
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

    const supabase = await createServerClientFromLib({ admin: true })

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
 * Verifica si un usuario es administrador
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
 * Crea un cliente Supabase para el servidor
 * Helper para componentes de servidor y API routes
 */
export async function createServerClient(options?: { admin?: boolean }) {
  return createServerClientFromLib(options)
}

/**
 * Registra un nuevo usuario (Server-Side)
 * @param email Email del usuario
 * @param password Contraseña del usuario
 * @param fullName Nombre completo del usuario
 * @param companyName Nombre de la empresa (opcional)
 * @returns Resultado del registro
 */
interface RegisterResult {
  success: boolean
  user?: User | null
  message: string
}
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  companyName = "",
): Promise<RegisterResult> {
  try {
    const supabase = await createServerClientFromLib()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"

    const redirectUrl = `${appUrl}/auth/callback`
    console.log(`URL de redirección para activación: ${redirectUrl}`)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, company_name: companyName },
      },
    })

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return { success: false, message: "Este correo electrónico ya está registrado." }
      }
      console.error("Error de Supabase al registrar:", authError)
      throw new Error(`Error al registrar el usuario: ${authError.message}`)
    }

    if (!authData.user) {
      if (authData.session === null && !authData.user) {
        console.log("Registro iniciado, esperando confirmación por correo electrónico.")
        return {
          success: true,
          user: null,
          message: "Usuario registrado. Por favor, verifica tu correo electrónico para activar tu cuenta.",
        }
      }
      throw new Error("No se pudo crear el usuario (authData.user es nulo)")
    }

    console.log(`Usuario ${authData.user.email} registrado. ID: ${authData.user.id}`)

    return {
      success: true,
      user: authData.user,
      message: "Usuario registrado correctamente. Por favor, verifica tu correo electrónico para activar tu cuenta.",
    }
  } catch (error) {
    let message = "Error desconocido al registrar el usuario"
    if (error instanceof Error) {
      message = error.message
    }
    console.error("Error en registerUser:", error)
    return {
      success: false,
      message: message,
    }
  }
}

