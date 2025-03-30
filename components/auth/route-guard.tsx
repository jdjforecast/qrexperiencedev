"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"

// PublicRoutes are accessible to everyone
const publicRoutes = ["/", "/login", "/register", "/auth/callback", "/auth/forgot-password", "/auth/update-password"]

// AdminRoutes are only accessible to admin users
const adminRoutes = ["/admin", "/admin/products", "/admin/orders", "/admin/users"]

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isAdmin, profile } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't do anything while auth is loading
    if (isLoading) return

    // Logic for routes that require authentication
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    const isAdminRoute = adminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

    // If not logged in and trying to access a protected route
    if (!isAuthenticated && !isPublicRoute) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
      return
    }

    // If logged in but not admin and trying to access admin route
    if (isAuthenticated && isAdminRoute && !isAdmin) {
      router.push("/dashboard")
      return
    }

    // If logged in and trying to access login/register
    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, isLoading, isAdmin, pathname, router])

  // While loading auth state, don't render children
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-azul-claro"></div>
          <p className="mt-2 text-lg text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

