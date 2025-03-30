import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { isPublicRoute, isAdminRoute } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Si se solicita forzar la actualización, permitir la solicitud
  if (searchParams.get("forceRefresh") === "true") {
    // Limpiar la cookie de sesión en la respuesta
    const response = NextResponse.next()
    response.cookies.delete("supabase-auth-token")
    return response
  }

  // Permitir rutas públicas sin autenticación
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  try {
    const response = NextResponse.next();
    
    // Crear cliente de Supabase para el servidor
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { 
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
          set: (name, value, options) => {
            response.cookies.set({ name, value, ...options });
          },
          remove: (name, options) => {
            response.cookies.delete({ name, ...options });
          }
        }
      }
    )

    // Verificar si hay una sesión activa
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Si no hay sesión, redirigir al login
    if (!session) {
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    // Para rutas de administrador, verificar permisos
    if (isAdminRoute(pathname)) {
      // Obtener el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      // Verificar si el usuario es administrador
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      const isAdmin =
        userData?.is_admin === true ||
        userData?.is_admin === "true" ||
        userData?.is_admin === 1 ||
        userData?.is_admin === "1"

      if (!isAdmin) {
        // Redirigir a dashboard si no es admin
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Usuario autenticado y con permisos correctos
    return response
  } catch (error) {
    console.error("Error in middleware:", error)

    // En caso de error, permitir el acceso a rutas públicas
    if (isPublicRoute(pathname)) {
      return NextResponse.next()
    }

    // Para otras rutas, redirigir al login
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Excluir archivos estáticos y API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}

