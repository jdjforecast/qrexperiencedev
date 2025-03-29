"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile } from "@/lib/auth"
import { RouteGuard } from "@/components/auth/route-guard"

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data, error } = await getUserProfile(user.id)

        if (error) {
          throw error
        }

        setProfile(data)
        setLoading(false)
      } catch (err) {
        console.error("Error al cargar perfil:", err)
        setError("No se pudo cargar la información del perfil")
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  return (
    <RouteGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Perfil de Usuario</h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Reintentar
            </button>
          </div>
        ) : !profile ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>No se encontró información de perfil</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Información Personal</h2>
              <p>
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p>
                <span className="font-medium">Nombre:</span> {profile.full_name || "No especificado"}
              </p>
              <p>
                <span className="font-medium">Empresa:</span> {profile.company_name || "No especificada"}
              </p>
            </div>

            {profile.role === "admin" && (
              <div className="mt-4 p-3 bg-blue-100 rounded-md">
                <p className="text-blue-800 font-medium">Tienes permisos de administrador</p>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Actualizar Información
              </button>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  )
}

