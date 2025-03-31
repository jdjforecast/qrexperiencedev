import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_CREDENTIALS } from "@/lib/auth/server-auth"

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/_next',
  '/api',
  '/static',
  '/login',
  '/register',
  '/',
  '/favicon.ico'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si es una ruta pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar rutas de administrador
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin-session');
    
    if (!adminSession?.value || !adminSession.value.includes(ADMIN_CREDENTIALS.email)) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Excluir archivos estáticos y API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}

