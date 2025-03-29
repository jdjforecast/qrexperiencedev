"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/auth/client"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams?.get("returnUrl") || "/dashboard"
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Por favor, completa todos los campos")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log("Iniciando proceso de login...")

      const result = await signIn(email, password)

      console.log("Resultado del login:", result)

      if (!result.success) {
        setError(result.message)
        toast({
          title: "Error de inicio de sesión",
          description: result.message,
          variant: "destructive",
        })
        return
      }

      console.log("Login exitoso, actualizando información del usuario...")

      // Actualizar el contexto de autenticación
      await refreshUser()

      console.log("Información del usuario actualizada, redirigiendo a:", returnUrl)

      toast({
        title: "Inicio de sesión exitoso",
        description: "Redirigiendo...",
        variant: "default",
      })

      // Pequeño retraso para asegurar que la sesión se establezca completamente
      setTimeout(() => {
        router.replace(returnUrl)
        router.refresh()
      }, 500)
    } catch (err) {
      console.error("Error en el proceso de login:", err)
      setError("Error al iniciar sesión. Por favor, intenta de nuevo.")
      toast({
        title: "Error de inicio de sesión",
        description: "Error al iniciar sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0055a5] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Iniciar Sesión</h2>
          <p className="mt-2 text-center text-sm text-white/80">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="font-medium text-[#a4ce4e] hover:text-[#b5df5f]">
              Regístrate
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-xl" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-white/20 bg-white/10 placeholder-white/60 text-white rounded-md focus:outline-none focus:ring-[#a4ce4e] focus:border-[#a4ce4e] focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-white/20 bg-white/10 placeholder-white/60 text-white rounded-md focus:outline-none focus:ring-[#a4ce4e] focus:border-[#a4ce4e] focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#a4ce4e] focus:ring-[#a4ce4e] border-white/30 rounded bg-white/10"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-[#a4ce4e] hover:text-[#b5df5f]">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-[#004489] hover:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a4ce4e] disabled:opacity-50 shadow-lg"
              onClick={() => console.log("Botón de inicio de sesión clickeado")}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/30 border border-red-500/50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-200">Error</h3>
                  <div className="mt-2 text-sm text-red-100">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

