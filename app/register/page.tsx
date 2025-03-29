"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("") // Mantenemos el campo en el formulario por ahora
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      // Pasamos companyName pero no se usará en la función registerUser actualizada
      const result = await registerUser(email, password, fullName, companyName)

      if (result.success) {
        await refreshUser()
        router.push("/dashboard")
      } else {
        setError(result.error || "Error al registrar el usuario")
      }
    } catch (err) {
      console.error("Error durante el registro:", err)
      setError("Error inesperado durante el registro")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Crear Cuenta</h1>

        {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Nombre de Empresa (Opcional)
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Este campo no se guardará actualmente</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}

