import { createServerClient, getBrowserClient } from "./supabase"
import { v4 as uuidv4 } from "uuid"
import QRCode from "qrcode"

// Generar un código QR y guardarlo en el bucket de Supabase
export async function generateAndStoreQRCode(productId: string, coinsValue = 0, description = "", createdBy: string) {
  try {
    const supabase = createServerClient()

    // Generar un código único para el QR
    const qrCode = uuidv4()

    // Crear el contenido del QR (puede ser un JSON con más información)
    const qrContent = JSON.stringify({
      productId,
      code: qrCode,
      timestamp: new Date().toISOString(),
    })

    // Generar la imagen del QR
    const qrImageBuffer = await QRCode.toBuffer(qrContent)

    // Nombre del archivo en el bucket
    const fileName = `qr_${qrCode}.png`

    // Subir la imagen al bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("qrs")
      .upload(fileName, qrImageBuffer, {
        contentType: "image/png",
        cacheControl: "3600",
      })

    if (uploadError) {
      throw uploadError
    }

    // Obtener la URL pública de la imagen
    const { data: urlData } = supabase.storage.from("qrs").getPublicUrl(fileName)

    const qrImageUrl = urlData.publicUrl

    // Guardar la información en la tabla qr_codes
    const { data, error } = await supabase
      .from("qr_codes")
      .insert({
        code: qrCode,
        product_id: productId,
        coins_value: coinsValue,
        created_by: createdBy,
        qr_image_url: qrImageUrl,
        description,
        is_used: false,
        veces_escaneado: 0,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, qrImageUrl }
  } catch (error) {
    console.error("Error al generar y almacenar el código QR:", error)
    throw error
  }
}

// Obtener todos los códigos QR
export async function getAllQRCodes() {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("qr_codes")
    .select(`
      *,
      product:product_id (*)
    `)
    .order("created_at", { ascending: false })

  return { data, error }
}

// Obtener un código QR por su código
export async function getQRCodeByCode(code: string) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("qr_codes")
    .select(`
      *,
      product:product_id (*)
    `)
    .eq("code", code)
    .single()

  return { data, error }
}

// Marcar un código QR como usado
export async function markQRCodeAsUsed(code: string) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase.from("qr_codes").update({ is_used: true }).eq("code", code).select()

  return { data, error }
}

// Incrementar el contador de escaneos
export async function incrementQRScanCount(code: string) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase.rpc("increment_qr_scan_count", { code_param: code })

  return { data, error }
}

