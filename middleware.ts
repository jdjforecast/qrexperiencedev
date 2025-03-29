import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/profile", "/orders", "/cart", "/checkout"]

// Rutas que requieren rol de administrador
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  console.log('Middleware Env URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Middleware Env Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = createMiddlewareClient({ req: request, res })

  // Verificar si hay una sesión activa
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Obtener la ruta actual
  const path = request.nextUrl.pathname

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route))

  // Si no hay sesión y la ruta requiere autenticación, redirigir a login
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("returnUrl", path)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay sesión pero la ruta es de administrador, verificar el rol
  if (session && isAdminRoute) {
    // Obtener el perfil del usuario para verificar el rol
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    // Si no es administrador, redirigir a la página principal
    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return res
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto:
     * 1. Todas las rutas que comienzan con /api, _next, static, public, favicon.ico
     * 2. Todas las rutas que terminan con un punto (archivos)
     */
    "/((?!api|_next|static|public|favicon.ico).*)",
  ],
}

