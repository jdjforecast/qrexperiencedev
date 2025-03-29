"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createBrowserClient } from "@/lib/supabase-client"
import { getUserProfile } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  profile: any | null
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  signOut: () => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  error: null,
  refreshUser: async () => {},
  signOut: async () => ({ success: false, message: "AuthContext not initialized" }),
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Actualizando información del usuario...")

      // Obtener la sesión actual directamente de supabase
      const supabase = createBrowserClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Error al obtener la sesión:", sessionError)
        setError("Error al obtener la sesión")
        return
      }

      if (!session) {
        console.log("No hay sesión activa")
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        return
      }

      console.log("Sesión encontrada, usuario:", session.user.email)
      setUser(session.user)

      // Obtener el perfil del usuario
      if (session.user) {
        try {
          const userProfile = await getUserProfile(session.user.id)
          console.log("Perfil de usuario:", userProfile)
          setProfile(userProfile)

          const admin = userProfile?.role === "admin"
          console.log("¿Es administrador?:", admin)
          setIsAdmin(admin)
        } catch (profileError) {
          console.error("Error al obtener el perfil:", profileError)
          // No establecer error para no bloquear la autenticación
          // Establecer un perfil básico
          setProfile({ id: session.user.id, role: "customer" })
          setIsAdmin(false)
        }
      }
    } catch (err) {
      console.error("Error al actualizar usuario:", err)
      setError("Error al actualizar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  // Implementación de la función signOut
  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error al cerrar sesión:", error)
        return {
          success: false,
          message: error.message || "Error al cerrar sesión",
        }
      }

      // Limpiar el estado
      setUser(null)
      setProfile(null)
      setIsAdmin(false)

      return {
        success: true,
        message: "Sesión cerrada correctamente",
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      return {
        success: false,
        message: error.message || "Error al cerrar sesión",
      }
    }
  }

  useEffect(() => {
    // Cargar datos del usuario al montar el componente
    refreshUser()

    // Suscribirse a cambios en la autenticación
    const supabase = createBrowserClient()
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Evento de autenticación:", event)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        console.log("Usuario ha iniciado sesión o token refrescado")
        await refreshUser()
      } else if (event === "SIGNED_OUT") {
        console.log("Usuario ha cerrado sesión")
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
      } else if (event === "USER_UPDATED") {
        console.log("Información del usuario actualizada")
        await refreshUser()
      }
    })

    // Configurar un intervalo para refrescar periódicamente la información del usuario
    const refreshInterval = setInterval(() => {
      console.log("Refrescando información del usuario (intervalo)")
      refreshUser()
    }, 60000) // Refrescar cada minuto

    return () => {
      console.log("Limpiando suscripción de autenticación")
      authListener.subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [])

  const value = {
    user,
    profile,
    isAdmin,
    isLoading,
    error,
    refreshUser,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

