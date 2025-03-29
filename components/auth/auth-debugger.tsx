"use client"

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"

export function AuthDebugger() {
  const { user, profile, isAdmin, isLoading, error, refreshUser } = useAuth()
  const [showDebugger, setShowDebugger] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    // Verificar si estamos en desarrollo o si se ha habilitado el depurador
    const isDev = process.env.NODE_ENV === "development"
    const debugEnabled = localStorage.getItem("auth_debug") === "true"
    setShowDebugger(isDev || debugEnabled)
  }, [])

  const handleRefresh = async () => {
    await refreshUser()
    setLastRefresh(new Date())
  }

  const toggleDebugger = () => {
    const newState = !showDebugger
    setShowDebugger(newState)
    localStorage.setItem("auth_debug", newState.toString())
  }

  if (!showDebugger) {
    return (
      <button
        onClick={toggleDebugger}
        className="fixed bottom-4 right-4 bg-gray-200 text-gray-800 p-2 rounded-full opacity-50 hover:opacity-100 z-50"
        title="Mostrar depurador de autenticación"
      >
        🔍
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 p-4 rounded-lg shadow-lg z-50 max-w-md w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Estado de Autenticación</h3>
        <button onClick={toggleDebugger} className="text-gray-500 hover:text-gray-700" title="Cerrar depurador">
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-semibold">Estado:</span>
          <span className={isLoading ? "text-yellow-600" : "text-green-600"}>
            {isLoading ? "Cargando..." : "Listo"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Autenticado:</span>
          <span className={user ? "text-green-600" : "text-red-600"}>{user ? "Sí" : "No"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Usuario:</span>
          <span className="truncate ml-2">{user?.email || "No autenticado"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">ID:</span>
          <span className="truncate ml-2">{user?.id || "N/A"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Perfil:</span>
          <span className={profile ? "text-green-600" : "text-red-600"}>{profile ? "Cargado" : "No disponible"}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Rol:</span>
          <span className={isAdmin ? "text-blue-600 font-bold" : "text-gray-600"}>{profile?.role || "N/A"}</span>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {lastRefresh && (
          <div className="text-xs text-gray-500 mt-1">Última actualización: {lastRefresh.toLocaleTimeString()}</div>
        )}

        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Actualizar Estado
          </button>

          <button
            onClick={() => {
              localStorage.clear()
              sessionStorage.clear()
              window.location.reload()
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Limpiar Cache
          </button>
        </div>
      </div>
    </div>
  )
}

