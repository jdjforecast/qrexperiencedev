"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth"
import Image from "next/image"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn(email, password)
      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(result.message || "Error al iniciar sesión")
      }
    } catch (err) {
      console.error("Error en el inicio de sesión:", err)
      setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setEmail("")
    setPassword("")
    setError("")
  }

  return (
    <div className="form-container">
      <div className="flex justify-center mb-6">
        <Image
          src="/images/nestledigitalpharmasummitvertical.svg"
          alt="Nestle Digital Pharma Summit"
          width={250}
          height={200}
          priority
        />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="flex justify-between">
          <button type="submit" disabled={isLoading} className="form-button">
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
          <button type="button" onClick={handleReset} className="form-button bg-azul-medio ml-2">
            Limpiar
          </button>
        </div>
      </form>
    </div>
  )
}

