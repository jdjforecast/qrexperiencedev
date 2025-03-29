import { getBrowserClient } from "./supabase"
import { getProductById } from "./api/products"

interface QRContent {
  code?: string
  product_id?: string
  [key: string]: any
}

interface QRProcessResult {
  isValid: boolean
  productId?: string
  code?: string
  error?: string
  product?: any
}

/**
 * Extrae el ID del producto del contenido de un código QR
 * @param qrContent El contenido del código QR (string JSON)
 * @returns Objeto con el resultado del procesamiento
 */
export async function extractProductId(qrContent: string): Promise<QRProcessResult> {
  console.log("Procesando contenido QR:", qrContent)

  try {
    // Intentar analizar el contenido como JSON
    let content: QRContent

    try {
      content = JSON.parse(qrContent)
    } catch (error) {
      console.error("Error parseando JSON del QR:", error)
      return {
        isValid: false,
        error: "Formato de QR inválido. El contenido no es JSON válido.",
      }
    }

    // Validar que el contenido tenga la estructura correcta
    if (!content.product_id) {
      console.error("Error: QR no contiene product_id", content)
      return {
        isValid: false,
        error: "QR inválido: no contiene ID de producto",
      }
    }

    // Obtener información del producto
    try {
      const product = await getProductById(content.product_id)

      if (!product) {
        console.error("Producto no encontrado:", content.product_id)
        return {
          isValid: false,
          productId: content.product_id,
          code: content.code,
          error: "Producto no encontrado",
        }
      }

      return {
        isValid: true,
        productId: content.product_id,
        code: content.code,
        product,
      }
    } catch (error) {
      console.error("Error obteniendo producto:", error)
      return {
        isValid: false,
        productId: content.product_id,
        code: content.code,
        error: "Error obteniendo información del producto",
      }
    }
  } catch (error) {
    console.error("Error procesando QR:", error)
    return {
      isValid: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Actualiza el contador de escaneos de un QR
 * @param {string} code - Código único del QR
 * @returns {Promise<{success: boolean, error: Error | null}>}
 */
export async function updateQRScanCount(code: string) {
  if (!code || typeof code !== "string" || code.trim() === "") {
    console.error("Código QR inválido para actualizar contador")
    return {
      success: false,
      error: new Error("Código QR inválido"),
    }
  }

  console.log(`Actualizando contador para QR code: ${code}`)

  try {
    const supabase = getBrowserClient()

    if (!supabase) {
      throw new Error("No se pudo obtener cliente de Supabase")
    }

    // Método 1: Intentar actualizar con RPC (método preferido)
    try {
      const { data, error } = await supabase.rpc("increment_qr_scan_count", {
        qr_code: code,
      })

      if (error) {
        console.warn("Error usando RPC para incrementar contador, intentando método alternativo:", error)
        // Falló el método RPC, continuamos con el método alternativo
      } else {
        console.log("Contador actualizado exitosamente usando RPC")
        return { success: true, error: null }
      }
    } catch (rpcError) {
      console.warn("Error en llamada RPC:", rpcError)
      // Continuamos con el método alternativo
    }

    // Método 2: Actualización directa (respaldo)
    const { data, error } = await supabase.from("qr_codes").select("veces_escaneado").eq("code", code).single()

    if (error) {
      console.error("Error obteniendo contador actual:", error)
      throw error
    }

    // Incrementar contador con el valor actual + 1
    const currentCount = data?.veces_escaneado || 0
    const newCount = currentCount + 1

    const { error: updateError } = await supabase
      .from("qr_codes")
      .update({ veces_escaneado: newCount })
      .eq("code", code)

    if (updateError) {
      console.error("Error actualizando contador:", updateError)
      throw updateError
    }

    console.log(`Contador actualizado: ${currentCount} -> ${newCount}`)
    return { success: true, error: null }
  } catch (error) {
    console.error("Error updating QR scan count:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Error desconocido actualizando contador"),
    }
  }
}

