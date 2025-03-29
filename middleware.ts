import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback', '/auth/forgot-password'];

// Rutas para admins
const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  // Crear un cliente básico de Supabase (sin persistencia de sesión)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Obtener token de JWT de las cookies
  const token = request.cookies.get('sb-access-token')?.value;
  
  if (token) {
    // Si hay token, configurar el cliente para usarlo
    supabase.auth.setSession({
      access_token: token,
      refresh_token: request.cookies.get('sb-refresh-token')?.value || '',
    });
  }

  // Intentar obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Comprobar si es ruta pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Comprobar si es ruta de admin
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Si no es ruta pública y no hay usuario, redirigir a login
  if (!isPublicRoute && !user) {
    url.pathname = '/login';
    url.searchParams.set('returnUrl', path);
    return NextResponse.redirect(url);
  }

  // Si es ruta de admin, verificar role
  if (isAdminRoute && user) {
    try {
      // Verificar si usuario es admin
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!data || data.role !== 'admin') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error verificando rol de admin:', error);
      // En caso de error, redirigir a dashboard
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
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