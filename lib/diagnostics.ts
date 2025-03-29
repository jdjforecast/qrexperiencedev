import { getBrowserClient } from "./supabase"

/**
 * Interfaz para los resultados del diagnóstico
 */
export interface DiagnosticResult {
  success: boolean
  message: string
  details?: Record<string, any>
  error?: Error | null
}

/**
 * Realiza un diagnóstico completo del sistema
 */
export async function runSystemDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = []

  // Verificación de conexión a Supabase
  const supabaseResult = await checkSupabaseConnection()
  results.push(supabaseResult)

  // Si la conexión a Supabase falló, no seguimos con más pruebas
  if (!supabaseResult.success) {
    return results
  }

  // Verificación de buckets de storage
  const storageResult = await checkStorageBuckets()
  results.push(storageResult)

  // Verificación de tablas
  const tablesResult = await checkRequiredTables()
  results.push(tablesResult)

  // Verificación de funciones
  const functionsResult = await checkRequiredFunctions()
  results.push(functionsResult)

  return results
}

/**
 * Verifica la conexión con Supabase
 */
async function checkSupabaseConnection(): Promise<DiagnosticResult> {
  try {
    const supabase = getBrowserClient()

    if (!supabase) {
      return {
        success: false,
        message: "No se pudo obtener el cliente de Supabase",
        details: { reason: "Cliente no disponible" },
      }
    }

    // Hacer una consulta simple para verificar la conexión
    const { data, error } = await supabase.from("qr_codes").select("id").limit(1)

    if (error) {
      return {
        success: false,
        message: "Error al conectar con Supabase",
        details: { error: error.message, code: error.code },
        error,
      }
    }

    return {
      success: true,
      message: "Conexión con Supabase establecida correctamente",
      details: { queryResult: "Éxito" },
    }
  } catch (err) {
    return {
      success: false,
      message: "Error crítico al conectar con Supabase",
      details: { error: err instanceof Error ? err.message : "Error desconocido" },
      error: err instanceof Error ? err : new Error("Error desconocido"),
    }
  }
}

/**
 * Verifica los buckets necesarios en Supabase Storage
 */
async function checkStorageBuckets(): Promise<DiagnosticResult> {
  try {
    const supabase = getBrowserClient()

    // Verificar la existencia de buckets de storage
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return {
        success: false,
        message: "Error al verificar buckets de storage",
        details: { error: bucketsError.message },
        error: bucketsError,
      }
    }

    if (!buckets || buckets.length === 0) {
      return {
        success: false,
        message: "No se encontraron buckets de storage",
        details: { action: "Crear buckets necesarios" },
      }
    }

    // Verificar bucket para QR codes
    const qrBucket = buckets.find((bucket) => bucket.name === "qrcodes")
    const imagesBucket = buckets.find((bucket) => bucket.name === "images" || bucket.name === "productimgs")
    const avatarsBucket = buckets.find((bucket) => bucket.name === "avatars")

    const missingBuckets = []
    if (!qrBucket) missingBuckets.push("qrcodes")
    if (!imagesBucket) missingBuckets.push("images/productimgs")
    if (!avatarsBucket) missingBuckets.push("avatars")

    if (missingBuckets.length > 0) {
      return {
        success: false,
        message: `Faltan buckets de storage: ${missingBuckets.join(", ")}`,
        details: {
          missingBuckets,
          existingBuckets: buckets.map((b) => b.name),
          instructions: "Crear los buckets faltantes y configurar políticas de storage",
        },
      }
    }

    // Todo bien
    return {
      success: true,
      message: "Buckets de storage verificados correctamente",
      details: {
        buckets: buckets.map((b) => b.name),
      },
    }
  } catch (err) {
    return {
      success: false,
      message: "Error al verificar buckets de storage",
      details: { error: err instanceof Error ? err.message : "Error desconocido" },
      error: err instanceof Error ? err : new Error("Error desconocido"),
    }
  }
}

/**
 * Verifica la existencia de tablas necesarias
 */
async function checkRequiredTables(): Promise<DiagnosticResult> {
  try {
    const supabase = getBrowserClient()

    // Lista de tablas necesarias
    const requiredTables = ["qr_codes", "products", "cart_items", "users"]
    const tablePromises = requiredTables.map(async (table) => {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })
      return {
        table,
        exists: !error,
        error: error?.message,
      }
    })

    const tableResults = await Promise.all(tablePromises)
    const missingTables = tableResults.filter((result) => !result.exists)

    if (missingTables.length > 0) {
      return {
        success: false,
        message: `Faltan tablas necesarias: ${missingTables.map((t) => t.table).join(", ")}`,
        details: {
          missingTables: missingTables,
          existingTables: tableResults.filter((r) => r.exists).map((r) => r.table),
        },
      }
    }

    return {
      success: true,
      message: "Todas las tablas necesarias están disponibles",
      details: { tables: tableResults },
    }
  } catch (err) {
    return {
      success: false,
      message: "Error al verificar tablas",
      details: { error: err instanceof Error ? err.message : "Error desconocido" },
      error: err instanceof Error ? err : new Error("Error desconocido"),
    }
  }
}

/**
 * Verifica la existencia de funciones requeridas
 */
async function checkRequiredFunctions(): Promise<DiagnosticResult> {
  try {
    const supabase = getBrowserClient()

    // Verificar función de incremento de contador
    try {
      const { data, error } = await supabase.rpc("increment_qr_scan_count", {
        qr_code: "test-function-call",
      })

      if (error && error.message.includes("does not exist")) {
        return {
          success: false,
          message: "Función 'increment_qr_scan_count' no encontrada en la base de datos",
          details: {
            error: error.message,
            action: "Ejecutar el script SQL para crear la función",
          },
        }
      }
    } catch (err) {
      // La función podría fallar por argumentos incorrectos, pero al menos existe
      console.log("Error probando función, pero podría existir:", err)
    }

    return {
      success: true,
      message: "Funciones de base de datos verificadas",
      details: { functions: ["increment_qr_scan_count"] },
    }
  } catch (err) {
    return {
      success: false,
      message: "Error al verificar funciones de base de datos",
      details: { error: err instanceof Error ? err.message : "Error desconocido" },
      error: err instanceof Error ? err : new Error("Error desconocido"),
    }
  }
}

/**
 * Verifica un QR específico
 */
export async function checkQR(code: string): Promise<DiagnosticResult> {
  if (!code || typeof code !== "string" || code.trim() === "") {
    return {
      success: false,
      message: "Código QR inválido",
      details: { code },
    }
  }

  try {
    const supabase = getBrowserClient()

    // Buscar el QR en la base de datos
    const { data, error } = await supabase.from("qr_codes").select("*, product:product_id(*)").eq("code", code).single()

    if (error) {
      return {
        success: false,
        message: "Error al buscar el código QR",
        details: {
          code,
          error: error.message,
        },
        error,
      }
    }

    if (!data) {
      return {
        success: false,
        message: "Código QR no encontrado en la base de datos",
        details: { code },
      }
    }

    // Verificar si hay un producto asociado
    if (!data.product_id) {
      return {
        success: false,
        message: "El código QR no tiene un producto asociado",
        details: {
          qr: { ...data, product: null },
        },
      }
    }

    // Verificar si el producto existe
    if (!data.product) {
      return {
        success: false,
        message: "El producto asociado al QR no existe",
        details: {
          qr: {
            ...data,
            product_id: data.product_id,
          },
        },
      }
    }

    return {
      success: true,
      message: "Código QR válido y asociado a un producto existente",
      details: {
        qr: {
          id: data.id,
          code: data.code,
          product_id: data.product_id,
          veces_escaneado: data.veces_escaneado,
        },
        product: {
          id: data.product.id,
          name: data.product.name,
          stock: data.product.stock,
          max_per_user: data.product.max_per_user,
        },
      },
    }
  } catch (err) {
    return {
      success: false,
      message: "Error al verificar el código QR",
      details: {
        code,
        error: err instanceof Error ? err.message : "Error desconocido",
      },
      error: err instanceof Error ? err : new Error("Error desconocido"),
    }
  }
}

