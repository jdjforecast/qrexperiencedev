"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { LogOut, Home, ShoppingCart, User, Settings } from "lucide-react"
import { supabaseClient } from "@/lib/supabase/client-utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await supabaseClient.auth.signOut()
      router.push("/login")
      toast({
        title: "Success",
        description: "You have been signed out",
        variant: "default",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "There was a problem signing out",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="flex h-20 items-center justify-center border-b">
          <h1 className="text-xl font-bold text-blue-600">MiPartner</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li>
              <Link
                href="/dashboard"
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <Home className="mr-3 h-5 w-5" />
                <span>Inicio</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/products"
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <ShoppingCart className="mr-3 h-5 w-5" />
                <span>Productos</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/profile"
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <User className="mr-3 h-5 w-5" />
                <span>Perfil</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                <Settings className="mr-3 h-5 w-5" />
                <span>Configuración</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">{children}</div>
    </div>
  )
}

