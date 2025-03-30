"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthFunctions } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const auth = getAuthFunctions()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { session } = await auth.signUpWithEmail(email, password)

      if (session) {
        // Si el registro fue exitoso y la sesión está disponible inmediatamente
        router.push("/dashboard")
      } else {
        // Si se requiere confirmación de email
        router.push("/login?message=check-email")
      }
    } catch (error: any) {
      console.error("Error during registration:", error)
      setError(error.message || "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registro</CardTitle>
        <CardDescription>Crea una nueva cuenta para comenzar</CardDescription>
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
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

