import { createClient } from '@supabase/supabase-js';

// Versión para el navegador (lado del cliente)
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan variables de entorno de Supabase');
    throw new Error('Faltan variables de entorno de Supabase');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
}

// Singleton para el lado del cliente
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient debe ser llamado solo en el cliente');
  }
  
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  
  return browserClient;
}

// Versión para el servidor
export function createServerClient(cookieStore?: { get: (name: string) => { value?: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan variables de entorno de Supabase');
    throw new Error('Faltan variables de entorno de Supabase');
  }
  
  // Si tenemos cookieStore, configurar con la cookie de sesión
  if (cookieStore) {
    const supabaseSessionCookie = cookieStore.get('supabase-auth-token')?.value;
    
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        ...(supabaseSessionCookie && {
          global: {
            headers: {
              Cookie: `supabase-auth-token=${supabaseSessionCookie}`
            }
          }
        })
      }
    });
  }
  
  // Versión básica sin cookie
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

// Versión para operaciones administrativas (solo servidor)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Faltan variables de entorno de Supabase');
    throw new Error('Faltan variables de entorno de Supabase para cliente admin');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

// Para mantener compatibilidad con el código existente
export function createSupabaseClient(options?: { admin?: boolean }) {
  if (options?.admin) {
    return createAdminClient();
  }
  
  if (typeof window !== 'undefined') {
    return getBrowserClient();
  }
  
  return createServerClient();
}

// Cliente Supabase para uso general (exportado por defecto)
export const supabase = createSupabaseClient();

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

