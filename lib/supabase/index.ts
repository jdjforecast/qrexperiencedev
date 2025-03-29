import { createClient } from '@supabase/supabase-js';

// Crear un cliente Supabase con las variables de entorno
export function createSupabaseClient(options?: { admin?: boolean }) {
  // Obtener las variables de entorno requeridas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Usar la clave de rol de servicio o la clave anónima según sea necesario
  const supabaseKey = options?.admin 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Variables de entorno de Supabase faltantes');
    throw new Error('Variables de entorno de Supabase faltantes');
  }
  
  // Crear y devolver el cliente Supabase
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: typeof window !== 'undefined' // Solo persistir la sesión en el navegador
    }
  });
}

// Cliente Supabase para uso general (exportado por defecto)
export const supabase = createSupabaseClient();

// Exportar también para casos donde se necesita un cliente admin
export function createAdminClient() {
  return createSupabaseClient({ admin: true });
}

// Constantes de rutas protegidas (exportadas para uso en componentes cliente)
export const PUBLIC_ROUTES = [
  '/',
  '/login', 
  '/register', 
  '/auth/callback', 
  '/auth/forgot-password', 
  '/auth/update-password'
];

export const ADMIN_ROUTES = [
  '/admin'
];

/**
 * Verifica si una ruta es pública
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
}

/**
 * Verifica si una ruta requiere acceso de administrador
 */
export function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
}

