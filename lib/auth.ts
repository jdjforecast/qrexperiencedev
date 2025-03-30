import { createBrowserClient, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/", "/login", "/register", "/scan", "/products", "/api"]

// Rutas que requieren permisos de administrador
const adminRoutes = ["/admin"]

// Verificar si una ruta es pública
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

// Verificar si una ruta requiere permisos de administrador
export function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

// Obtener el usuario actual (versión para componentes de servidor)
export const getCurrentUser = cache(async () => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      // En lugar de lanzar un error, simplemente devolvemos null
      return null
    }

    const { data: user, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
})

// Verificar si el usuario actual es administrador (con caché)
export const isUserAdmin = cache(async () => {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return false
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies }
    )

    // Primero verificar en la tabla users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (userData) {
      const isAdmin =
        userData.is_admin === true ||
        userData.is_admin === "true" ||
        userData.is_admin === 1 ||
        userData.is_admin === "1"

      return isAdmin
    }

    // Si no hay datos en users, verificar en profiles
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileData) {
      const isAdmin =
        profileData.is_admin === true ||
        profileData.is_admin === "true" ||
        profileData.is_admin === 1 ||
        profileData.is_admin === "1"

      return isAdmin
    }

    return false
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
})

// Verificar autenticación y redirigir si no está autenticado
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

// Verificar permisos de administrador y redirigir si no es administrador
export async function requireAdmin() {
  const user = await requireAuth()
  const isAdmin = await isUserAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  return user
}

// Funciones de autenticación para el cliente
export function getAuthFunctions() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return {
    signInWithEmail: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return data
    },

    signUpWithEmail: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return data
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }
    },
  }
}

