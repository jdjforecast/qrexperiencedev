"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function RefreshAuthPage() {
  const { refreshUser, user, isAdmin } = useAuth()
  const [status, setStatus] = useState("Actualizando estado de autenticación...")
  const [attempts, setAttempts] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const updateAuth = async () => {
      try {
        setStatus("Actualizando estado de autenticación...")
        await refreshUser()
        setAttempts((prev) => prev + 1)

        if (user) {
          setStatus(`Usuario autenticado: ${user.email} (${isAdmin ? "Admin" : "Usuario normal"})`)
          // Redirigir después de 2 segundos
          setTimeout(() => {
            router.push("/")
          }, 2000)
        } else if (attempts < 3) {
          setStatus("No se detectó sesión activa, intentando de nuevo...")
          // Intentar de nuevo después de 1 segundo
          setTimeout(updateAuth, 1000)
        } else {
          setStatus("No se pudo detectar una sesión activa después de varios intentos.")
        }
      } catch (error) {
        setStatus(`Error al actualizar estado: ${error.message}`)
      }
    }

    updateAuth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Actualizando Autenticación</h1>

        <div className="text-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{status}</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

