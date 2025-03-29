"use client"

import type React from "react"

import { useState } from "react"

export default function MakeAdminPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/admin/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Usuario actualizado correctamente",
        })
        setEmail("")
      } else {
        setResult({
          success: false,
          error: data.error || "Error al actualizar el usuario",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Error al procesar la solicitud",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Hacer Administrador a un Usuario</h1>

      <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Hacer Administrador"}
          </button>
        </form>

        {result && (
          <div
            className={`mt-4 p-3 rounded-md ${
              result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {result.success ? result.message : result.error}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>
            Esta acción convertirá al usuario con el correo electrónico especificado en un administrador del sistema,
            otorgándole acceso a todas las funciones administrativas.
          </p>
        </div>
      </div>
    </div>
  )
}

