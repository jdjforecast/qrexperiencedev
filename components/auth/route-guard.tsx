"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
}

export default function RouteGuard({ children, requireAuth = false, requireAdmin = false }: RouteGuardProps) {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Si todavía está cargando, no hacer nada
    if (isLoading) return

    // Verificar autorización
    if (requireAuth && !user) {
      // Redirigir a login si se requiere autenticación y no hay usuario
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
    } else if (requireAdmin && !isAdmin) {
      // Redirigir a la página principal si se requiere admin y el usuario no es admin
      router.push("/")
    } else {
      // Usuario autorizado
      setIsAuthorized(true)
    }
  }, [user, isAdmin, isLoading, requireAuth, requireAdmin, router, pathname])

  // Mostrar spinner mientras se carga o verifica la autorización
  if (isLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Renderizar los hijos si está autorizado
  return <>{children}</>
}

