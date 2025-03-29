/**
 * Utilidades para la generación y gestión de códigos QR
 */

import { createServerClient, executeWithTimeout } from "./supabase-client"
import { getProductQrUrl } from "./routes"
import type { QrCode, Product } from "./db-schema"

/**
 * Genera un código alfanumérico único para QR
 */
export function generateQrCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""

  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

/**
 * Crea un nuevo código QR para un producto
 */
export async function createProductQr(
  productId: string,
  description?: string,
  coinsValue = 0,
): Promise<{ qrCode: QrCode | null; error: Error | null }> {
  try {
    const supabase = createServerClient()

    // Verificar que el producto existe
    const { data: product, error: productError } = await executeWithTimeout(
      supabase.from("products").select("*").eq("id", productId).single(),
      10000,
      "Verificar producto",
    )

    if (productError || !product) {
      return {
        qrCode: null,
        error: new Error(productError?.message || "Producto no encontrado"),
      }
    }

    // Generar código único
    const code = generateQrCode()

    // Crear registro de QR
    const { data: qrCode, error: qrError } = await executeWithTimeout(
      supabase
        .from("qr_codes")
        .insert({
          code,
          product_id: productId,
          description: description || `QR para ${product.name}`,
          coins_value: coinsValue,
          is_used: false,
          veces_escaneado: 0,
        })
        .select("*")
        .single(),
      10000,
      "Crear código QR",
    )

    if (qrError) {
      return { qrCode: null, error: new Error(qrError.message) }
    }

    return { qrCode, error: null }
  } catch (error) {
    console.error("Error creating QR code:", error)
    return {
      qrCode: null,
      error: error instanceof Error ? error : new Error("Error desconocido al crear QR"),
    }
  }
}

/**
 * Genera una URL para un código QR basado en un producto
 */
export function generateQrUrl(product: Product): string {
  return getProductQrUrl(product.urlpage || product.id)
}

/**
 * Incrementa el contador de escaneos de un QR
 */
export async function incrementQrScanCount(code: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = createServerClient()

    const { error } = await executeWithTimeout(
      supabase.rpc("increment_qr_scan_count", { qr_code: code }),
      5000,
      "Incrementar contador QR",
    )

    if (error) {
      return { success: false, error: new Error(error.message) }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error incrementing QR scan count:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Error desconocido al incrementar contador"),
    }
  }
}

/**
 * Obtiene información de un QR por su código
 */
export async function getQrByCode(code: string): Promise<{ qrCode: QrCode | null; error: Error | null }> {
  try {
    const supabase = createServerClient()

    const { data, error } = await executeWithTimeout(
      supabase
        .from("qr_codes")
        .select(`
        *,
        product:product_id (*)
      `)
        .eq("code", code)
        .single(),
      5000,
      "Obtener QR por código",
    )

    if (error) {
      return { qrCode: null, error: new Error(error.message) }
    }

    return { qrCode: data, error: null }
  } catch (error) {
    console.error("Error getting QR by code:", error)
    return {
      qrCode: null,
      error: error instanceof Error ? error : new Error("Error desconocido al obtener QR"),
    }
  }
}

