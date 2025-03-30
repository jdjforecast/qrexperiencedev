"use client"

/**
 * Cliente de autenticación - funciones específicas para componentes cliente
 *
 * Este archivo contiene funciones relacionadas con la autenticación
 * que solo pueden usarse en componentes cliente.
 */

import { getBrowserClient } from "../supabase"

/**
 * Registra un nuevo usuario usando Supabase
 */
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  companyName = "",
): Promise<{ success: boolean; message?: string; error?: string }> {
  const supabaseClient = getBrowserClient()

  try {
    // 1. Registrar el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    })

    if (authError) {
      return {
        success: false,
        error: authError.message,
        message: authError.message,
      }
    }

    // 2. Crear un registro en la tabla de perfiles
    if (authData.user) {
      const { error: profileError } = await supabaseClient.from("profiles").insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        company_name: companyName,
        role: "user", // Rol por defecto
      })

      if (profileError) {
        console.error("Error al crear perfil:", profileError)
        // Continuamos porque el usuario ya está creado en Auth
      }
    }

    return {
      success: true,
      message: "Usuario registrado correctamente",
    }
  } catch (error) {
    console.error("Error en registro:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    return {
      success: false,
      error: errorMessage,
      message: errorMessage,
    }
  }
}

/**
 * Función para validar si un usuario puede acceder a un recurso
 * basado en su rol (para usar en client components)
 */
export function canAccess(userRole: string | undefined, requiredRole = "user"): boolean {
  if (!userRole) return false
  if (requiredRole === "admin") return userRole === "admin"
  return true // Si el rol requerido es user, cualquier usuario autenticado puede acceder
}

