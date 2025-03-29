"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Gauge, Package, QrCode, Users, ShoppingBag, LogOut, Menu, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/BackButton"
import { useAuth } from "@/components/auth/AuthProvider"
import { LoadingFallback } from "@/components/ui/loading-fallback"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/admin")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <LoadingFallback />
  }

  if (!isAuthenticated) {
    return null // Don't render anything during the redirect
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/")

  const adminRoutes = [
    { name: "Dashboard", path: "/admin", icon: <Gauge size={18} /> },
    { name: "Productos", path: "/admin/products", icon: <Package size={18} /> },
    { name: "Códigos QR", path: "/admin/qr-codes", icon: <QrCode size={18} /> },
    { name: "Usuarios", path: "/admin/users", icon: <Users size={18} /> },
    { name: "Pedidos", path: "/admin/orders", icon: <ShoppingBag size={18} /> },
    { name: "Análisis QR", path: "/admin/analytics", icon: <Gauge size={18} /> },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-68px)]">
      {/* Sidebar móvil toggle */}
      <div className="md:hidden p-4 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 w-full justify-between"
        >
          <span className="flex items-center gap-2">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            <span>Menú de Administración</span>
          </span>
          <ChevronRight size={16} className={`transition-transform ${sidebarOpen ? "rotate-90" : ""}`} />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-full md:w-64 bg-background/90 backdrop-blur-md border-r border-border 
                   md:flex flex-col md:h-[calc(100vh-68px)] md:sticky md:top-[68px] 
                   ${sidebarOpen ? "flex" : "hidden"}`}
      >
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Panel de Administración</h2>
          <p className="text-xs text-muted-foreground">Gestión del sistema</p>
        </div>

        <nav className="p-2 flex-1">
          <ul className="space-y-1">
            {adminRoutes.map((route) => (
              <li key={route.path}>
                <Button
                  variant={isActive(route.path) ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className="w-full justify-start gap-2"
                >
                  <Link href={route.path}>
                    {route.icon}
                    <span>{route.name}</span>
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-2 mt-auto border-t">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full justify-start gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Link href="/">
              <LogOut size={18} />
              <span>Salir</span>
            </Link>
          </Button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-4">
        <div className="mb-6">
          <BackButton fallbackPath="/admin" />
          {children}
        </div>
      </main>
    </div>
  )
}

