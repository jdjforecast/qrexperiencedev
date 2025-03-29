/**
 * Configuración del modo de desarrollo
 *
 * Este archivo permite habilitar/deshabilitar características durante el desarrollo
 * para facilitar el trabajo sin tener que preocuparse por la autenticación.
 */

// Establece a true para deshabilitar la autenticación durante el desarrollo
export const DISABLE_AUTH = true

// Establece a true para usar datos de usuario de prueba cuando la autenticación está deshabilitada
export const USE_MOCK_USER = true

// Usuario de prueba para desarrollo
export const MOCK_USER = {
  id: "dev-user-id",
  email: "dev@example.com",
  user_metadata: {
    full_name: "Usuario de Desarrollo",
    company_name: "Empresa de Prueba",
  },
  app_metadata: {
    role: "admin", // 'admin' o 'user'
  },
}

// Perfil de prueba para desarrollo
export const MOCK_PROFILE = {
  id: "dev-user-id",
  full_name: "Usuario de Desarrollo",
  company_name: "Empresa de Prueba",
  role: "admin",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

