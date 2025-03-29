import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilidades generales para la aplicación
 */

/**
 * Formatea un número como moneda
 * @param value - El valor a formatear
 * @param currency - La moneda (por defecto MXN)
 * @returns El valor formateado como moneda
 */
export function formatCurrency(value: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea una fecha en formato legible
 * @param date - La fecha a formatear
 * @returns La fecha formateada
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Trunca un texto a una longitud máxima
 * @param text - El texto a truncar
 * @param maxLength - La longitud máxima
 * @returns El texto truncado
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Genera un ID único
 * @returns Un ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Retrasa la ejecución por un tiempo determinado
 * @param ms - Milisegundos a esperar
 * @returns Una promesa que se resuelve después del tiempo especificado
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

