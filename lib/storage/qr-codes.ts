import { createServerClient, getBrowserClient } from "../supabase"
import { v4 as uuidv4 } from "uuid"
import QRCode from "qrcode"
import type { QRCodeData, QRGenerationResult } from "@/types/qr-code"

// Declare module for qrcode
declare module "qrcode" {
  export function toBuffer(
    content: string,
    options?: {
      errorCorrectionLevel?: string
      margin?: number
      width?: number
    },
  ): Promise<Buffer>
}

// Función para convertir base64 a Blob
function b64toBlob(b64Data: string, contentType = "image/png"): Blob {
  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays, { type: contentType })
}

// Generar un código QR y guardarlo en el bucket de Supabase
export const generateAndStoreQRCode = async (qrData: QRCodeData): Promise<QRGenerationResult> => {
  if (!qrData || !qrData.product_id) {
    console.error("Error: Datos QR inválidos o falta ID de producto")
    return { success: false, error: "Datos QR inválidos o falta ID de producto" }
  }

  console.log(`Iniciando generación de QR para producto ID: ${qrData.product_id}`)

  try {
    // Verificar si ya existe un QR para este producto
    const supabase = getBrowserClient()
    if (!supabase) {
      console.error("Error: No se pudo obtener cliente de Supabase")
      return { success: false, error: "Error de conexión con base de datos" }
    }

    const { data: existingQrs, error: existingQrsError } = await supabase
      .from("qr_codes")
      .select("id, qr_image_url")
      .eq("product_id", qrData.product_id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (existingQrsError) {
      console.error("Error al verificar QRs existentes:", existingQrsError)
      // Continuamos para intentar generar uno nuevo
    } else if (existingQrs && existingQrs.length > 0 && existingQrs[0].qr_image_url) {
      console.log("QR existente encontrado, verificando validez")
      try {
        const response = await fetch(existingQrs[0].qr_image_url, { method: "HEAD" })
        if (response.ok) {
          console.log("QR existente válido, retornando URL")
          return {
            success: true,
            url: existingQrs[0].qr_image_url,
          }
        }
        console.log("QR existente no válido, generando nuevo")
      } catch (error) {
        console.error("Error verificando URL de QR existente:", error)
        // Continuamos para generar uno nuevo
      }
    }

    // Obtener información del producto para incluir en el QR
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", qrData.product_id)
      .single()

    if (productError || !productData) {
      console.error("Error obteniendo información del producto:", productError)
      return {
        success: false,
        error: `Error obteniendo información del producto: ${productError?.message || "Producto no encontrado"}`,
      }
    }

    // Crear el contenido del QR con información completa del producto
    const qrContent = {
      code: qrData.code,
      product_id: qrData.product_id,
    }

    console.log("Generando QR con contenido:", JSON.stringify(qrContent).substring(0, 100) + "...")

    // Generar el QR como data URL
    let qrDataUrl
    try {
      qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrContent), {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 300,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
    } catch (qrGenerationError) {
      console.error("Error crítico generando QR:", qrGenerationError)
      return {
        success: false,
        error: `Error generando QR: ${qrGenerationError instanceof Error ? qrGenerationError.message : "Error desconocido"}`,
      }
    }

    if (!qrDataUrl || !qrDataUrl.startsWith("data:image/png;base64,")) {
      console.error("QR generado inválido")
      return { success: false, error: "QR generado inválido" }
    }

    // Convertir data URL a Blob para subir
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "")
    const blob = b64toBlob(base64Data, "image/png")

    if (!blob) {
      console.error("Error convirtiendo QR a formato de imagen")
      return { success: false, error: "Error procesando imagen QR" }
    }

    // Nombre del archivo con formato product-id_timestamp.png para evitar colisiones
    const timestamp = Date.now()
    const fileName = `qr_${qrData.product_id}_${timestamp}.png`
    console.log(`Intentando subir QR como: ${fileName}`)

    // Intentar subir el QR a Supabase Storage
    let qrUrl = ""
    let uploadError = null

    // Intentar primero con el bucket 'qrcodes'
    try {
      const { data: uploadData, error: uploadErr } = await supabase.storage.from("qrcodes").upload(fileName, blob, {
        contentType: "image/png",
        upsert: true,
      })

      if (uploadErr) {
        console.error("Error primer intento de subida a bucket 'qrcodes':", uploadErr)
        uploadError = uploadErr
      } else if (uploadData) {
        const { data: urlData } = await supabase.storage.from("qrcodes").getPublicUrl(uploadData.path)

        if (urlData && urlData.publicUrl) {
          qrUrl = urlData.publicUrl
          console.log("QR subido exitosamente a bucket 'qrcodes':", qrUrl)
        }
      }
    } catch (error) {
      console.error("Error crítico subiendo a bucket 'qrcodes':", error)
      uploadError = error instanceof Error ? error : new Error("Error desconocido")
    }

    // Si fallamos con 'qrcodes', intentar con 'avatars'
    if (!qrUrl) {
      try {
        console.log("Intentando subir a bucket alternativo 'avatars'")
        const { data: uploadData, error: uploadErr } = await supabase.storage.from("avatars").upload(fileName, blob, {
          contentType: "image/png",
          upsert: true,
        })

        if (uploadErr) {
          console.error("Error en subida a bucket 'avatars':", uploadErr)
        } else if (uploadData) {
          const { data: urlData } = await supabase.storage.from("avatars").getPublicUrl(uploadData.path)

          if (urlData && urlData.publicUrl) {
            qrUrl = urlData.publicUrl
            console.log("QR subido exitosamente a bucket 'avatars':", qrUrl)
          }
        }
      } catch (error) {
        console.error("Error crítico subiendo a bucket 'avatars':", error)
      }
    }

    // Si todavía fallamos, intentar con 'productimgs'
    if (!qrUrl) {
      try {
        console.log("Intentando subir a bucket alternativo 'productimgs'")
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("productimgs")
          .upload(fileName, blob, {
            contentType: "image/png",
            upsert: true,
          })

        if (uploadErr) {
          console.error("Error en subida a bucket 'productimgs':", uploadErr)
        } else if (uploadData) {
          const { data: urlData } = await supabase.storage.from("productimgs").getPublicUrl(uploadData.path)

          if (urlData && urlData.publicUrl) {
            qrUrl = urlData.publicUrl
            console.log("QR subido exitosamente a bucket 'productimgs':", qrUrl)
          }
        }
      } catch (error) {
        console.error("Error crítico subiendo a bucket 'productimgs':", error)
      }
    }

    if (!qrUrl) {
      console.error("No se pudo subir el QR a ningún bucket", uploadError)
      return {
        success: false,
        error: `Error subiendo QR: ${uploadError?.message || "Error desconocido"}`,
      }
    }

    // Guardar el QR en la base de datos
    let insertedQrId = ""
    const qrRecord = {
      id: qrData.id,
      code: qrData.code,
      product_id: qrData.product_id,
      coins_value: qrData.coins_value || 0,
      is_used: false,
      created_at: new Date().toISOString(),
      created_by: qrData.created_by,
      description: qrData.description || `QR para ${productData.name}`,
      qr_image_url: qrUrl,
      veces_escaneado: 0,
    }

    // Si ya existe un QR, actualizarlo
    if (existingQrs && existingQrs.length > 0) {
      const { error: updateError } = await supabase
        .from("qr_codes")
        .update({ qr_image_url: qrUrl })
        .eq("id", existingQrs[0].id)

      if (updateError) {
        console.error("Error actualizando QR existente:", updateError)
        // Intentar insertar uno nuevo en vez de actualizar
      } else {
        console.log("QR existente actualizado con nueva URL")
        insertedQrId = existingQrs[0].id
      }
    }

    // Si no hay QR existente o falló la actualización, insertar uno nuevo
    if (!insertedQrId) {
      const { data: insertData, error: insertError } = await supabase.from("qr_codes").insert(qrRecord).select()

      if (insertError) {
        console.error("Error guardando QR en base de datos:", insertError)
        return {
          success: false,
          error: `Error guardando QR en base de datos: ${insertError.message}`,
        }
      }

      if (insertData && insertData.length > 0) {
        insertedQrId = insertData[0].id
        console.log("Nuevo QR insertado en base de datos:", insertedQrId)
      }
    }

    console.log("QR generado y almacenado con éxito")
    return {
      success: true,
      url: qrUrl,
      code: qrData.code,
      qrId: insertedQrId,
    }
  } catch (error) {
    console.error("Error general en generación de QR:", error)
    return {
      success: false,
      error: `Error crítico generando QR: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
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

// Actualizar el contador de escaneos de un QR por su código
export async function incrementQRScanCount(code: string) {
  const supabase = getBrowserClient()
  const { data, error } = await supabase
    .from("qr_codes")
    .update({
      veces_escaneado: supabase.raw("veces_escaneado + 1"),
      last_scanned_at: new Date().toISOString(),
    })
    .eq("code", code)
    .select()
    .single()

  return { data, error }
}

// Eliminar un código QR
export async function deleteQRCode(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from("qr_codes").delete().eq("id", id)
  return { error }
}

// Actualizar un código QR
export async function updateQRCode(id: string, updates: Partial<QRCodeData>) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("qr_codes").update(updates).eq("id", id).select().single()

  return { data, error }
}

// Obtener estadísticas de códigos QR
export async function getQRCodeStats() {
  const supabase = getBrowserClient()

  // Total de códigos QR
  const { count: totalQRCodes } = await supabase.from("qr_codes").select("*", { count: "exact", head: true })

  // Códigos QR escaneados
  const { count: scannedQRCodes } = await supabase
    .from("qr_codes")
    .select("*", { count: "exact", head: true })
    .gt("veces_escaneado", 0)

  // Códigos QR usados
  const { count: usedQRCodes } = await supabase
    .from("qr_codes")
    .select("*", { count: "exact", head: true })
    .eq("is_used", true)

  // Top 5 códigos QR más escaneados
  const { data: topQRCodes } = await supabase
    .from("qr_codes")
    .select(`
      *,
      product:product_id (*)
    `)
    .order("veces_escaneado", { ascending: false })
    .limit(5)

  return {
    totalQRCodes: totalQRCodes || 0,
    scannedQRCodes: scannedQRCodes || 0,
    usedQRCodes: usedQRCodes || 0,
    topQRCodes: topQRCodes || [],
  }
}

// Función para ayudar a registrar errores de almacenamiento de manera detallada
function logStorageError(operation: string, error: any) {
  console.error(`Error en operación de almacenamiento [${operation}]:`, {
    message: error?.message || "Error desconocido",
    status: error?.status,
    statusCode: error?.statusCode,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
  })
}

// Función para subir con reintentos automáticos
async function uploadWithRetry(bucket: string, fileName: string, blob: Blob, maxRetries = 3): Promise<any> {
  const supabase = getBrowserClient()
  let lastError = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Intento ${attempt}/${maxRetries} de subida a bucket '${bucket}'`)

      const { data, error } = await supabase.storage.from(bucket).upload(fileName, blob, {
        contentType: "image/png",
        upsert: true,
      })

      if (error) {
        lastError = error
        console.warn(`Error en intento ${attempt}:`, error)
        // Esperar antes del siguiente intento (backoff exponencial)
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
        continue
      }

      return { data, error: null }
    } catch (error) {
      lastError = error
      console.error(`Excepción en intento ${attempt}:`, error)
      // Esperar antes del siguiente intento
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
    }
  }

  return { data: null, error: lastError }
}

// Función auxiliar para generar un código único corto
function generateUniqueCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Genera un código QR simple que redirige a la página del producto
 * Versión simplificada que solo genera la URL del producto
 */
export async function generateQRCodeSimple(productId: string) {
  try {
    // Verificar si ya existe QR para este producto
    const supabase = getBrowserClient()

    // Comprobar si ya existe un código QR para este producto
    const { data: existingQR, error: qrError } = await supabase
      .from("qr_codes")
      .select("id, code, qr_image_url")
      .eq("product_id", productId)
      .maybeSingle()

    if (qrError) {
      console.error("Error checking existing QR:", qrError)
      throw qrError
    }

    // Si ya existe un QR y tiene URL de imagen, devolverlo
    if (existingQR && existingQR.qr_image_url) {
      return {
        success: true,
        qrCode: existingQR.code,
        qrImageUrl: existingQR.qr_image_url,
        message: "QR code already exists",
      }
    }

    // Obtener información del producto
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("id, name, urlpage")
      .eq("id", productId)
      .single()

    if (productError) {
      console.error("Error fetching product data:", productError)
      throw productError
    }

    // Generar un código único para el QR
    const qrCode = existingQR?.code || uuidv4()

    // Crear URL de producto (asegurando que no sea muy larga)
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://mipartnerv0.vercel.app"

    // Usar urlpage si existe y no es muy larga, o usar ID
    const urlPath = productData.urlpage && productData.urlpage.length < 90 ? productData.urlpage : productId

    // URL completa del producto
    const productUrl = `${baseUrl}/product/${urlPath}`

    // Generar imagen QR con la URL del producto
    const qrImage = await QRCode.toDataURL(productUrl, {
      margin: 2,
      scale: 8,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Convertir base64 a blob para subir a storage
    const blob = await (await fetch(qrImage)).blob()
    const fileName = `qr_${productId}.png`

    // Subir QR a storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("qrcodes").upload(fileName, blob, {
      contentType: "image/png",
      upsert: true,
    })

    if (uploadError) {
      console.error("Error uploading QR image:", uploadError)
      throw uploadError
    }

    // Obtener URL pública
    const { data: urlData } = await supabase.storage.from("qrcodes").getPublicUrl(fileName)

    const qrImageUrl = urlData.publicUrl

    // Si ya existe el registro QR, actualizar solo la URL de la imagen
    if (existingQR) {
      const { error: updateError } = await supabase
        .from("qr_codes")
        .update({
          qr_image_url: qrImageUrl,
        })
        .eq("id", existingQR.id)

      if (updateError) {
        console.error("Error updating QR record:", updateError)
        throw updateError
      }

      return {
        success: true,
        qrCode,
        qrImageUrl,
        message: "QR code image updated",
      }
    }

    // Si no existe, crear nuevo registro en la tabla qr_codes
    const { error: insertError } = await supabase.from("qr_codes").insert({
      code: qrCode,
      product_id: productId,
      coins_value: 0,
      is_used: false,
      qr_image_url: qrImageUrl,
      veces_escaneado: 0,
      description: `QR para producto: ${productData.name}`,
      product_url: productUrl,
      created_by: supabase.auth.getUser() ? (await supabase.auth.getUser()).data.user?.id : null,
    })

    if (insertError) {
      console.error("Error creating QR record:", insertError)
      throw insertError
    }

    return {
      success: true,
      qrCode,
      qrImageUrl,
      productUrl,
      message: "QR code created successfully",
    }
  } catch (error) {
    console.error("Error in generateQRCodeSimple:", error)
    return {
      success: false,
      message: "Failed to generate QR code: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

// Función para diagnosticar problemas de almacenamiento
export async function diagnosticQRStorage(): Promise<{ success: boolean; report: string; details: any }> {
  try {
    console.log("🔍 Iniciando diagnóstico de almacenamiento para QR")
    const supabase = getBrowserClient()
    if (!supabase) {
      return {
        success: false,
        report: "No se pudo obtener el cliente de Supabase",
        details: { error: "Cliente no disponible" },
      }
    }

    const report: string[] = []
    const details: any = {
      buckets: {},
      policies: [],
      errors: [],
    }

    // 1. Verificar la conexión básica a Supabase
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) {
        report.push("❌ Error en la conexión a Supabase Auth")
        details.errors.push({
          component: "auth",
          error: userError.message,
        })
      } else {
        report.push("✅ Conexión a Supabase Auth exitosa")
        details.auth = {
          authenticated: !!userData.user,
          user_id: userData.user?.id || "no autenticado",
        }
      }
    } catch (authError) {
      report.push("❌ Error crítico al verificar autenticación")
      details.errors.push({
        component: "auth",
        error: authError instanceof Error ? authError.message : "Error desconocido",
      })
    }

    // 2. Listar todos los buckets disponibles
    try {
      const { data: bucketList, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        report.push(`❌ Error al listar buckets: ${bucketsError.message}`)
        details.errors.push({
          component: "buckets",
          error: bucketsError.message,
        })
      } else {
        const bucketNames = bucketList?.map((b) => b.name) || []
        report.push(`ℹ️ Buckets disponibles (${bucketList?.length || 0}): ${bucketNames.join(", ") || "ninguno"}`)
        details.buckets.list = bucketList || []

        // Verificar el bucket principal 'qrcodes'
        const qrBucket = bucketList?.find((b) => b.name === "qrcodes")
        if (qrBucket) {
          report.push("✅ Bucket 'qrcodes' encontrado")
          details.buckets.qrcodes = qrBucket

          // Intentar una carga de prueba al bucket
          try {
            const testFileName = `test_${Date.now()}.txt`
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("qrcodes")
              .upload(testFileName, new Blob(["test"]), {
                contentType: "text/plain",
                upsert: true,
              })

            if (uploadError) {
              report.push(`❌ Error en prueba de carga a 'qrcodes': ${uploadError.message}`)
              details.buckets.qrcodes.testUpload = {
                success: false,
                error: uploadError.message,
              }
            } else {
              report.push("✅ Prueba de carga a 'qrcodes' exitosa")
              details.buckets.qrcodes.testUpload = {
                success: true,
                path: uploadData?.path,
              }

              // Limpiar el archivo de prueba
              await supabase.storage.from("qrcodes").remove([testFileName])
            }
          } catch (uploadError) {
            report.push("❌ Error crítico en prueba de carga")
            details.errors.push({
              component: "testUpload",
              error: uploadError instanceof Error ? uploadError.message : "Error desconocido",
            })
          }
        } else {
          report.push("❌ No se encontró el bucket 'qrcodes' (requerido)")
          details.buckets.qrcodes = null
        }
      }
    } catch (bucketError) {
      report.push("❌ Error crítico al listar buckets")
      details.errors.push({
        component: "listBuckets",
        error: bucketError instanceof Error ? bucketError.message : "Error desconocido",
      })
    }

    return {
      success: details.errors.length === 0 && !!details.buckets.qrcodes,
      report: report.join("\n"),
      details,
    }
  } catch (error) {
    return {
      success: false,
      report: `❌ Error en diagnóstico: ${error instanceof Error ? error.message : "Error desconocido"}`,
      details: { criticalError: error },
    }
  }
}

/**
 * Función simplificada para registrar un QR en la base de datos
 * Esta función ya no genera QRs, solo registra información para el seguimiento
 */
export async function registerQRCode(productId: string, externalQrCode: string, productUrl: string) {
  try {
    const supabase = getBrowserClient()

    // Verificar si ya existe un registro para este código QR
    const { data: existingQR, error: qrError } = await supabase
      .from("qr_codes")
      .select("id, code")
      .eq("code", externalQrCode)
      .maybeSingle()

    if (qrError) {
      console.error("Error checking existing QR:", qrError)
      throw qrError
    }

    // Si ya existe un registro con este código, devolver el existente
    if (existingQR) {
      return {
        success: true,
        code: existingQR.code,
        message: "QR code already registered",
      }
    }

    // Obtener información del producto
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .single()

    if (productError) {
      console.error("Error fetching product data:", productError)
      throw productError
    }

    // Registrar el QR en la base de datos
    const { error: insertError } = await supabase.from("qr_codes").insert({
      code: externalQrCode,
      product_id: productId,
      coins_value: 0,
      is_used: false,
      veces_escaneado: 0,
      description: `QR externo para producto: ${productData.name}`,
      product_url: productUrl,
      created_by: supabase.auth.getUser() ? (await supabase.auth.getUser()).data.user?.id : null,
    })

    if (insertError) {
      console.error("Error creating QR record:", insertError)
      throw insertError
    }

    return {
      success: true,
      code: externalQrCode,
      message: "QR code registered successfully",
    }
  } catch (error) {
    console.error("Error in registerQRCode:", error)
    return {
      success: false,
      message: "Failed to register QR code: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

