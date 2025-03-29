"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ErrorMessages } from "@/lib/error-messages"

// Intervalo de refresco en milisegundos (10 minutos)
const REFRESH_INTERVAL = 10 * 60 * 1000

export function SessionRefresh() {
  const { refreshAuth, session, error } = useAuth()
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Establecer el intervalo de refresco
  useEffect(() => {
    const setupRefreshTimer = () => {
      // Limpiar cualquier temporizador existente
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }

      // Solo configurar el temporizador si hay una sesión activa
      if (session) {
        refreshTimerRef.current = setInterval(() => {
          refreshAuth().catch((err) => {
            console.error("Error refreshing session:", err)
            toast({
              variant: "destructive",
              title: "Error de sesión",
              description: ErrorMessages.AUTH.SESSION_EXPIRED,
            })
          })
        }, REFRESH_INTERVAL)
      }
    }

    // Configurar el temporizador inicial
    setupRefreshTimer()

    // Limpiar al desmontar
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [session, refreshAuth, toast])

  // Manejar errores de autenticación
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: error,
      })
    }
  }, [error, toast])

  // Este componente no renderiza nada visible
  return null
}

