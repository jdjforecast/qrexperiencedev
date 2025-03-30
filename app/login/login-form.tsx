"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getAuthFunctions } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = getAuthFunctions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { session } = await auth.signInWithEmail(email, password)

      if (session) {
        // Redirigir a la página original o al dashboard
        const redirectTo = searchParams.get("redirect") || "/dashboard"
        router.push(redirectTo)
      }
    } catch (error: any) {
      console.error("Error during login:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <div className="text-center text-sm">
            <Link href="/register" className="text-blue-600 hover:underline">
              ¿No tienes una cuenta? Regístrate
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

