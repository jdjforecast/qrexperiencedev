"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"

interface AuthGuardProps {
  children: ReactNode
  requireAdmin?: boolean
  fallback?: ReactNode
}

export default function AuthGuard({ children, requireAdmin = false, fallback = <AuthLoading /> }: AuthGuardProps) {
  const { user, isAdmin, isLoading, error, refreshSession } = useAuth()
  const [localLoading, setLocalLoading] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  const maxRetries = 2 // Ya tenemos reintentos en el contexto, así que reducimos aquí

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        // Si ya hay un error en el contexto y aún no hemos agotado los reintentos
        if (error && retryCount < maxRetries) {
          setLocalError(`Error de autenticación. Reintentando (${retryCount + 1}/${maxRetries})...`)
          setRetryCount((prev) => prev + 1)

          // Esperar antes de reintentar (backoff exponencial)
          const delay = Math.pow(2, retryCount) * 1500
          await new Promise((resolve) => setTimeout(resolve, delay))

          // Intentar refrescar la sesión
          if (isMounted) {
            await refreshSession()
          }
          return
        }

        // Verificar autenticación
        if (!isLoading) {
          if (!user) {
            if (isMounted) {
              router.push("/login")
            }
            return
          }

          // Verificar rol de admin si es necesario
          if (requireAdmin && !isAdmin) {
            if (isMounted) {
              setLocalError("No tienes permisos de administrador")
              router.push("/")
            }
            return
          }

          // Todo correcto, mostrar contenido
          if (isMounted) {
            setLocalLoading(false)
            setLocalError(null)
          }
        }
      } catch (err) {
        console.error("[AuthGuard] Error:", err)

        if (!isMounted) return

        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1)
          const delay = Math.pow(2, retryCount) * 1500

          setLocalError(`Error inesperado. Reintentando en ${delay / 1000}s...`)

          setTimeout(() => {
            if (isMounted) {
              checkAuth()
            }
          }, delay)
        } else {
          setLocalError("No se pudo verificar la autenticación después de varios intentos")
          setLocalLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [user, isAdmin, isLoading, error, router, requireAdmin, retryCount, refreshSession])

  // Mostrar estado de carga
  if (isLoading || localLoading) {
    return (
      <div className="min-h-screen">
        {localError || error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              {localError || error}
            </div>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          fallback
        )}
      </div>
    )
  }

  // Si hay error pero no estamos cargando, mostrar mensaje de error
  if ((localError || error) && !isLoading && !localLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">{localError || error}</div>
        <button
          onClick={() => {
            setRetryCount(0)
            setLocalLoading(true)
            refreshSession()
          }}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Reintentar
        </button>
      </div>
    )
  }

  // Todo correcto, mostrar contenido
  return <>{children}</>
}

function AuthLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Verificando autenticación...</p>
    </div>
  )
}

