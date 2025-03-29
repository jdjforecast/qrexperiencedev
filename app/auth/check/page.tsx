"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { supabaseClient } from "@/lib/supabase/client-utils"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CheckAuthPage() {
  const { user, profile, isAdmin, refreshUser } = useAuth()
  const [sessionStatus, setSessionStatus] = useState("Verificando...")
  const [cookieStatus, setCookieStatus] = useState("Verificando...")
  const [localStorageStatus, setLocalStorageStatus] = useState("Verificando...")
  const [supabaseStatus, setSupabaseStatus] = useState("Verificando...")
  const [isFixing, setIsFixing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Verificar estado del contexto
      setSessionStatus(user ? `Activa (${user.email})` : "No hay sesión activa")

      // Verificar cookies
      const hasCookies = document.cookie.includes("supabase")
      setCookieStatus(hasCookies ? "Cookies de Supabase encontradas" : "No se encontraron cookies de Supabase")

      // Verificar localStorage
      const hasLocalStorage = localStorage.getItem("supabase.auth.token") !== null
      setLocalStorageStatus(
        hasLocalStorage ? "Datos de autenticación encontrados" : "No se encontraron datos de autenticación",
      )

      // Verificar directamente con Supabase
      const { data, error } = await supabaseClient.auth.getSession()

      if (error) {
        setSupabaseStatus(`Error: ${error.message}`)
      } else if (data.session) {
        setSupabaseStatus(`Sesión válida (${data.session.user.email})`)
      } else {
        setSupabaseStatus("No hay sesión activa en Supabase")
      }
    } catch (error) {
      console.error("Error al verificar autenticación:", error)
    }
  }

  const fixAuth = async () => {
    setIsFixing(true)
    try {
      // 1. Refrescar el token si es posible
      await supabaseClient.auth.refreshSession()

      // 2. Forzar actualización del contexto
      await refreshUser()

      // 3. Verificar de nuevo
      await checkAuth()

      // 4. Si sigue sin funcionar, sugerir iniciar sesión de nuevo
      if (!user) {
        alert("No se pudo restaurar la sesión. Por favor, inicia sesión de nuevo.")
        router.push("/login")
      }
    } catch (error) {
      console.error("Error al intentar corregir la autenticación:", error)
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">
            Diagnóstico de Autenticación
          </div>
          <h1 className="text-2xl font-bold mb-6">Verificación del Estado de Sesión</h1>

          <div className="space-y-4">
            <div className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-medium">Estado en Contexto:</span>
                <span className={user ? "text-green-600" : "text-red-600"}>{sessionStatus}</span>
              </div>
              {profile && (
                <div className="flex justify-between mt-1 text-sm">
                  <span>Rol:</span>
                  <span className={isAdmin ? "text-blue-600 font-semibold" : ""}>{profile.role}</span>
                </div>
              )}
            </div>

            <div className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-medium">Cookies:</span>
                <span className={cookieStatus.includes("encontradas") ? "text-green-600" : "text-red-600"}>
                  {cookieStatus}
                </span>
              </div>
            </div>

            <div className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-medium">LocalStorage:</span>
                <span className={localStorageStatus.includes("encontrados") ? "text-green-600" : "text-red-600"}>
                  {localStorageStatus}
                </span>
              </div>
            </div>

            <div className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-medium">API Supabase:</span>
                <span className={supabaseStatus.includes("válida") ? "text-green-600" : "text-red-600"}>
                  {supabaseStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
            <button
              onClick={checkAuth}
              className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Verificar de nuevo
            </button>

            <button
              onClick={fixAuth}
              disabled={isFixing}
              className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isFixing
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {isFixing ? "Corrigiendo..." : "Intentar corregir"}
            </button>

            <button
              onClick={() => router.push("/login")}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Ir a Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

