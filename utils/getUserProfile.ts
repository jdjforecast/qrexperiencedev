/**
 * Este archivo sirve como un puente para mantener compatibilidad con código que importa desde '@v0/utils/getUserProfile'
 * Redirige todas las importaciones a la función oficial en lib/auth.ts
 */

import { getUserProfile as getProfileFromAuth } from "@/lib/auth"

// Exportar la función oficial
export const getUserProfile = getProfileFromAuth

// Exportación por defecto para importaciones como: import getUserProfile from '@v0/utils/getUserProfile'
export default getProfileFromAuth

