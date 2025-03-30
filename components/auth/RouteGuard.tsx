"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export default function RouteGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  redirectTo = "/login",
}: RouteGuardProps) {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Esperar a que se cargue la información de autenticación
    if (isLoading) return

    // Si requiere autenticación y no hay usuario, redirigir
    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    // Si requiere permisos de administrador y el usuario no es admin, redirigir
    if (requireAdmin && !isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [user, isAdmin, isLoading, requireAuth, requireAdmin, redirectTo, router])

  // Mostrar nada mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Si requiere autenticación y no hay usuario, no mostrar nada (la redirección se maneja en useEffect)
  if (requireAuth && !user) {
    return null
  }

  // Si requiere permisos de administrador y el usuario no es admin, no mostrar nada
  if (requireAdmin && !isAdmin) {
    return null
  }

  // Si pasa todas las verificaciones, mostrar los children
  return <>{children}</>
}

