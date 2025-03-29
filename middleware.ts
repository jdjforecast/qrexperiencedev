import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/profile", "/orders", "/cart", "/checkout"]

// Rutas que requieren rol de administrador
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  // console.log('Middleware Env URL:', process.env.NEXT_PUBLIC_SUPABASE_URL); // Consider removing or using proper logging
  // console.log('Middleware Env Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); // Consider removing or using proper logging

  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Middleware Error: Supabase URL or Anon Key is not defined.");
    // Optionally return a generic error response or redirect
    // return new NextResponse('Internal Server Error: Configuration missing', { status: 500 });
    return res; // Or proceed cautiously / redirect to an error page
  }

  const supabase = createMiddlewareClient({ req: request, res })

  let session = null;
  try {
    // Verificar si hay una sesión activa
    const {
      data: { session: sessionData },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Middleware Error getting session:", sessionError);
      // Decide how to handle session errors (e.g., proceed without session, redirect to error page)
      // For now, we'll proceed as if there's no session
    } else {
      session = sessionData;
    }
  } catch (error) {
    console.error("Middleware Critical Error during getSession:", error);
    // Handle unexpected errors during session fetching
    // return new NextResponse('Internal Server Error', { status: 500 });
    return res; // Or redirect to a generic error page
  }


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

  // Si hay sesión y es una ruta de administrador, verificar el rol
  if (session && isAdminRoute) {
    try {
      // Obtener el perfil del usuario para verificar el rol (Only when needed)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
          console.error("Middleware Error fetching profile:", profileError);
          // Decide how to handle profile fetching errors (e.g., deny access, redirect)
          return NextResponse.redirect(new URL("/error-fetching-profile", request.url)); // Example redirect
      }

      // Si no es administrador, redirigir a la página principal
      if (!profile || profile.role !== "admin") {
        console.warn(`User ${session.user.id} attempted to access admin route ${path} without admin role.`);
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
        console.error("Middleware Critical Error during profile check:", error);
        // Handle unexpected errors during profile checking
        return NextResponse.redirect(new URL("/server-error", request.url)); // Example redirect
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

