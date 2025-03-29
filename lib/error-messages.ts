/**
 * Mensajes de error estandarizados para la aplicación
 * Esto ayuda a mantener consistencia en los mensajes de error mostrados al usuario
 */

export const ErrorMessages = {
  // Errores de autenticación
  AUTH: {
    INVALID_CREDENTIALS: "Credenciales inválidas. Por favor verifica tu correo y contraseña.",
    SESSION_EXPIRED: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
    REGISTRATION_FAILED: "No se pudo completar el registro. Por favor intenta de nuevo.",
    UNAUTHORIZED: "No tienes permiso para acceder a este recurso.",
    EMAIL_IN_USE: "Este correo electrónico ya está en uso. Por favor usa otro o inicia sesión.",
  },

  // Errores de red/API
  API: {
    NETWORK_ERROR: "Error de conexión. Por favor verifica tu conexión a internet.",
    SERVER_ERROR: "Error en el servidor. Por favor intenta más tarde.",
    REQUEST_FAILED: "La solicitud no pudo ser procesada. Por favor intenta nuevamente.",
    TIMEOUT: "La solicitud ha tardado demasiado tiempo. Por favor intenta más tarde.",
  },

  // Errores de productos
  PRODUCTS: {
    NOT_FOUND: "Producto no encontrado.",
    FETCH_ERROR: "No se pudieron cargar los productos. Por favor intenta más tarde.",
    UNAVAILABLE: "Este producto no está disponible en este momento.",
  },

  // Errores de carrito
  CART: {
    ADD_ERROR: "No se pudo agregar el producto al carrito.",
    REMOVE_ERROR: "No se pudo eliminar el producto del carrito.",
    UPDATE_ERROR: "No se pudo actualizar el carrito.",
    EMPTY_ERROR: "Tu carrito está vacío.",
    FETCH_ERROR: "No se pudieron cargar los productos del carrito.",
  },

  // Errores de QR
  QR: {
    SCAN_FAILED: "Error al escanear el código QR. Por favor intenta nuevamente.",
    INVALID_CODE: "Código QR no válido o ya utilizado.",
    CAMERA_ERROR: "Error al acceder a la cámara. Por favor verifica los permisos.",
  },

  // Errores de perfil
  PROFILE: {
    UPDATE_FAILED: "No se pudo actualizar el perfil. Por favor intenta más tarde.",
    FETCH_ERROR: "Error al cargar datos del perfil.",
  },

  // Errores generales
  GENERAL: {
    UNEXPECTED_ERROR: "Ha ocurrido un error inesperado. Por favor intenta nuevamente.",
    FORM_VALIDATION: "Por favor verifica los campos del formulario e intenta nuevamente.",
    PERMISSION_DENIED: "Permiso denegado. Verifica los permisos necesarios.",
    NOT_IMPLEMENTED: "Esta funcionalidad aún no está disponible.",
  },
}

/**
 * Función para formatear errores de API con información adicional
 * Solo en desarrollo muestra detalles técnicos
 */
export function formatApiError(error: any, userMessage?: string): string {
  // Mensaje para el usuario
  const message = userMessage || ErrorMessages.API.REQUEST_FAILED

  // En desarrollo, agregamos detalles técnicos
  if (process.env.NODE_ENV === "development") {
    const errorDetails = error?.message || JSON.stringify(error)
    return `${message} (Detalles: ${errorDetails})`
  }

  // En producción, solo mostramos el mensaje de usuario
  return message
}

