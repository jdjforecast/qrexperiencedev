"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getBrowserClient } from "@/lib/supabase-client"

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = getBrowserClient()

    // Obtener la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)

      if (session?.user) {
        checkAdminStatus(session.user.id)
      }

      setIsLoading(false)
    })

    // Suscribirse a cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user || null)

      if (session?.user) {
        checkAdminStatus(session.user.id)
      } else {
        setIsAdmin(false)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Verificar si el usuario es administrador
  const checkAdminStatus = async (userId: string) => {
    try {
      const supabase = getBrowserClient()

      // Verificar en la tabla users
      const { data, error } = await supabase.from("users").select("is_admin").eq("id", userId).single()

      if (!error && data) {
        const adminStatus =
          data.is_admin === true || data.is_admin === "true" || data.is_admin === 1 || data.is_admin === "1"

        setIsAdmin(adminStatus)
        return
      }

      // Si no hay datos en users, verificar en profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single()

      if (!profileError && profileData) {
        const adminStatus =
          profileData.is_admin === true ||
          profileData.is_admin === "true" ||
          profileData.is_admin === 1 ||
          profileData.is_admin === "1"

        setIsAdmin(adminStatus)
        return
      }

      setIsAdmin(false)
    } catch (error) {
      console.error("Error checking admin status:", error)
      setIsAdmin(false)
    }
  }

  // Función para cerrar sesión
  const signOut = async () => {
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
  }

  return <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signOut }}>{children}</AuthContext.Provider>
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  return useContext(AuthContext)
}

