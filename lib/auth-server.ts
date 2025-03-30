import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

// Cliente para el servidor con caché
export const getServerClient = cache(() => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
})

// Verificar si el usuario actual es administrador (con caché)
export const isUserAdmin = cache(async () => {
  try {
    const supabase = getServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return false
    }

    const { data: userData } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", session.user.id)
      .single()

    return userData?.is_admin === true || userData?.is_admin === "true" || userData?.is_admin === 1
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
})

// Verificar autenticación y redirigir si no está autenticado
export async function requireAuth() {
  const supabase = getServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return session.user
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