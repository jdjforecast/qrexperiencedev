import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback', '/auth/forgot-password'];

// Rutas para admins
const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Comprobar si es ruta pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Obtener sesión de NextAuth
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Si no hay sesión y no es ruta pública, redirigir a login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', path);
    return NextResponse.redirect(url);
  }

  // Comprobar si es ruta de admin
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Si es ruta de admin, verificar rol
  if (isAdminRoute && token.role !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Rutas que queremos proteger
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/cart/:path*',
    '/checkout/:path*',
  ],
}; 