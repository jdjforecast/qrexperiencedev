/**
 * Definición centralizada de rutas para la aplicación
 * Esto facilita el mantenimiento y evita errores de tipeo en las rutas
 */

export const ROUTES = {
  // Rutas públicas
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  SCANNER: "/scanner",
  CART: "/cart",
  CHECKOUT: "/checkout",

  // Rutas de usuario
  PROFILE: "/profile",
  ORDERS: "/orders",

  // Rutas de administración
  ADMIN: {
    DASHBOARD: "/admin",
    PRODUCTS: "/admin/products",
    PRODUCT_NEW: "/admin/products/new",
    PRODUCT_EDIT: (id: string) => `/admin/products/edit/${id}`,
    PRODUCT_URLS: "/admin/products/urls",
    QR_CODES: "/admin/qr-codes",
    QR_CREATE: "/admin/qr-codes/create",
    USERS: "/admin/users",
    ORDERS: "/admin/orders",
    ANALYTICS: "/admin/analytics",
  },

  // Rutas de prueba y utilidades
  QR_TEST: "/qr/test",

  // API endpoints
  API: {
    PRODUCTS: "/api/products",
    QR_GENERATE: "/api/qr/generate",
    QR_ANALYTICS: "/api/analytics/qr",
    CHART_DATA: "/api/chart-data",
  },
}

/**
 * Función para generar URL absoluta (útil para QR y compartir)
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")
  return `${baseUrl}${path}`
}

/**
 * Función para generar URL de producto para QR
 */
export function getProductQrUrl(id: string): string {
  return getAbsoluteUrl(ROUTES.PRODUCT_DETAIL(id))
}

