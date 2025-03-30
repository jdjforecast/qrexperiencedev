"use client"

import { createBrowserClient } from "@supabase/ssr"

// Cliente para el navegador
export function getBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Funciones de autenticación para el cliente
export function getAuthFunctions() {
  const supabase = getBrowserClient()

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

    getSession: async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }

      return session
    },

    getUser: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        throw error
      }

      return user
    }
  }
} 