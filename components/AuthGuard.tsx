"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { isUserAdmin } from "@/lib/auth-utils"
import { createBrowserClient } from "@supabase/ssr"

/**
 * Propiedades para el componente AuthGuard
 * @interface AuthGuardProps
 */
interface AuthGuardProps {
  /** Contenido a renderizar cuando la autenticación es exitosa */
  children: React.ReactNode
  /** Indica si se requiere acceso de administrador */
  requireAdmin?: boolean
  /** Ruta de redirección si la autenticación falla */
  redirectTo?: string
}

/**
 * Componente que protege rutas basado en autenticación y roles de usuario
 * @param {AuthGuardProps} props - Propiedades del componente
 * @returns {JSX.Element | null} El contenido protegido o null durante validación
 */
export default function AuthGuard({ children, requireAdmin = false, redirectTo = "/" }: AuthGuardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  // Crear cliente de Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    let mounted = true
    let authTimeout: NodeJS.Timeout | null = null

    /**
     * Verifica la autenticación del usuario y los permisos de administrador si es necesario
     */
    const checkAuth = async () => {
      try {
        // Configurar un timeout para la verificación de autenticación
        authTimeout = setTimeout(() => {
          if (mounted) {
            console.error("AuthGuard: Timeout en la verificación de autenticación")

            // Si aún no hemos alcanzado el máximo de reintentos, intentamos de nuevo
            if (retryCount < MAX_RETRIES) {
              setRetryCount((prev) => prev + 1)
              console.log(`Reintentando verificación de autenticación (${retryCount + 1}/${MAX_RETRIES})...`)
              checkAuth() // Reintentar
            } else {
              setIsLoading(false)
              toast({
                title: "Error de conexión",
                description: "No se pudo verificar tu sesión. Por favor, recarga la página.",
                variant: "destructive",
              })
            }
          }
        }, 15000) // 15 segundos de timeout (aumentado para dar más margen)

        // Obtener la sesión actual
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        // Si no hay sesión, redirigir
        if (!session) {
          if (mounted) {
            setIsLoading(false)
            toast({
              title: "Sesión requerida",
              description: "Debes iniciar sesión para acceder a esta página",
              variant: "destructive",
            })
            router.push("/login")
          }
          return
        }

        // Obtener detalles del usuario
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError

        if (!user) {
          if (mounted) {
            setIsLoading(false)
            toast({
              title: "Usuario no encontrado",
              description: "No se encontró información de tu usuario",
              variant: "destructive",
            })
            router.push("/login")
          }
          return
        }

        // Verificar permisos de administrador si es necesario
        if (requireAdmin) {
          const hasAdminAccess = await isUserAdmin(user.id)
          if (!hasAdminAccess) {
            if (mounted) {
              toast({
                title: "Acceso denegado",
                description: "No tienes permisos para acceder a esta página",
                variant: "destructive",
              })
              router.push(redirectTo)
            }
            return
          }
        }

        // Autenticación exitosa
        if (mounted) {
          setIsAuthenticated(true)
          setIsLoading(false)
          // Resetear el contador de reintentos
          setRetryCount(0)
        }
      } catch (error) {
        console.error("AuthGuard: Error en la verificación de autenticación:", error)

        // Si aún no hemos alcanzado el máximo de reintentos, intentamos de nuevo
        if (retryCount < MAX_RETRIES && mounted) {
          setRetryCount((prev) => prev + 1)
          console.log(`Reintentando verificación de autenticación (${retryCount + 1}/${MAX_RETRIES})...`)

          // Esperar un poco antes de reintentar (backoff exponencial)
          setTimeout(checkAuth, 1000 * Math.pow(2, retryCount))
        } else if (mounted) {
          setIsLoading(false)
          toast({
            title: "Error de autenticación",
            description: "Ocurrió un error al verificar tu sesión",
            variant: "destructive",
          })
          router.push("/login")
        }
      } finally {
        // Limpiar el timeout
        if (authTimeout) clearTimeout(authTimeout)
      }
    }

    // Iniciar la verificación de autenticación
    checkAuth()

    // Limpiar al desmontar
    return () => {
      mounted = false
      if (authTimeout) clearTimeout(authTimeout)
    }
  }, [router, requireAdmin, toast, redirectTo, retryCount])

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0033A0] mb-4"></div>
        <p className="text-gray-600">
          Verificando acceso{retryCount > 0 ? ` (intento ${retryCount}/${MAX_RETRIES})` : ""}...
        </p>
      </div>
    )
  }

  // No mostrar contenido si no está autenticado
  if (!isAuthenticated) {
    return null
  }

  // Mostrar contenido protegido
  return <>{children}</>
}

