"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      setIsLoading(true)

      // 1. Cerrar sesión en Supabase
      await supabase.auth.signOut()

      // 2. Limpiar localStorage
      localStorage.clear()

      // 3. Limpiar sessionStorage
      sessionStorage.clear()

      // 4. Forzar recarga de la página para limpiar caché de Next.js
      router.push("/login?forceRefresh=true")

      // 5. Forzar recarga completa del navegador
      window.location.href = "/login?forceRefresh=true"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
    >
      {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  )
}

