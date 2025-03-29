import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/profile", "/orders", "/cart", "/checkout"]

// Rutas que requieren rol de administrador
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
  // Obtener los datos de respuesta
  const response = NextResponse.next()
  
  // Verificar si estamos ejecutando en un entorno donde las variables de entorno están disponibles
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Obtener la ruta actual
  const path = request.nextUrl.pathname

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route))
  
  // Si la ruta no necesita protección, continuar normalmente
  if (!isProtectedRoute && !isAdminRoute) {
    return response;
  }

  // Si no tenemos las variables de entorno, no podemos hacer verificaciones de auth
  if (!supabaseUrl || !supabaseKey) {
    console.error("Middleware: Variables de entorno de Supabase no disponibles");
    // Si es una ruta protegida, redirigir al login
    if (isProtectedRoute || isAdminRoute) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("returnUrl", path)
      return NextResponse.redirect(redirectUrl)
    }
    return response;
  }

  try {
    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // Obtener la sesión del usuario
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    // Si no hay sesión y la ruta requiere autenticación, redirigir a login
    if (!session && (isProtectedRoute || isAdminRoute)) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("returnUrl", path)
      return NextResponse.redirect(redirectUrl)
    }

    // Si hay sesión y es una ruta de administrador, verificar el rol
    if (session && isAdminRoute) {
      try {
        // Obtener el perfil del usuario para verificar el rol
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profileError) {
          console.error("Middleware Error fetching profile:", profileError);
          // Redirigir a una página de error
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // Si no es administrador, redirigir a la página principal
        if (!profile || profile.role !== "admin") {
          console.warn(`User ${session.user.id} attempted to access admin route ${path} without admin role.`);
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      } catch (error) {
        console.error("Middleware Critical Error during profile check:", error);
        // Manejar errores inesperados
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  } catch (error) {
    console.error('Error en middleware:', error);
    // Si hay un error y la ruta requiere autenticación, redirigir al login
    if (isProtectedRoute || isAdminRoute) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("returnUrl", path)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. /api (rutas API)
     * 2. /_next (rutas internas de Next.js)
     * 3. /_static (archivos estáticos si se usa Next.js con exportación estática)
     * 4. Todas las rutas con un punto (archivos como favicon.ico, etc.)
     */
    '/((?!api|_next|_static|[\\w-]+\\.\\w+).*)',
  ],
}

