import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/index';

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback', '/auth/forgot-password'];

// Rutas para admins
const ADMIN_ROUTES = ['/admin'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  
  // Comprobar si es ruta pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    return res;
  }
  
  // Crear cliente Supabase usando cookies
  const supabase = createServerClient({
    get: (name) => {
      const cookie = req.cookies.get(name);
      return { value: cookie?.value };
    }
  });
  
  // Verificar sesión
  const { data: { session } } = await supabase.auth.getSession();
  
  // Si no hay sesión y no es ruta pública, redirigir a login
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Comprobar si es ruta de admin
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Si es ruta de admin, verificar rol
  if (isAdminRoute) {
    // Obtener perfil de usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    // Si no es admin, redirigir
    if (!profile || profile.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }
  
  return res;
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