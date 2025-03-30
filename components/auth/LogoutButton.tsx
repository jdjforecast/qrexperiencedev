"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { getAuthFunctions } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const auth = getAuthFunctions()
  
  const handleLogout = async () => {
    try {
      setIsLoading(true)
      
      // Cerrar sesión
      await auth.signOut()
      
      // Limpiar cualquier estado local
      localStorage.clear()
      sessionStorage.clear()
      
      // Limpiar cookies del servidor
      await fetch("/api/clear-cache", { method: "POST" })
      
      // Redireccionar con refresh forzado
      router.push("/login?forceRefresh=true")
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleLogout}
      disabled={isLoading}
      variant="ghost"
      size="sm"
    >
      {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  )
}

