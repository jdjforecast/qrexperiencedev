import { NextResponse } from "next/server"
// Remove the specific supabase-js import
// import { createClient } from "@supabase/supabase-js"
// Import the server client helper from lib/auth which handles cookies
import { createServerClient, isUserAdmin } from "@/lib/auth"
// Remove the import for the simpler server client
// import { createServerClient as simpleServerClient } from "@/lib/supabase/server"

// Define tipos para los datos de escaneo
interface QRScanEvent {
  device_info?: Record<string, any>
  product_id?: string
  products?: {
    id: string
    name: string
  }
  created_at?: string
}

// Define la estructura de datos para las estadísticas de QR
interface QRScanStats {
  totalScans: number
  successRate: number
  deviceTypes: Record<string, number>
  topProducts: Array<{
    id: string
    name: string
    scans: number
  }>
  scansByDate: Record<string, number>
}

export async function GET(request: Request) {
  try {
    // Initialize the cookie-aware server client
    const supabase = await createServerClient()

    // Get the user session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting Supabase session:", sessionError)
      return NextResponse.json({ error: "Error checking authentication" }, { status: 500 })
    }

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is an admin using the helper function
    const isAdmin = await isUserAdmin(session.user.id)

    if (!isAdmin) {
      console.warn(`User ${session.user.id} attempted to access QR analytics without admin role.`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Proceed with fetching stats now that auth is confirmed

    // 1. Obtener el total de escaneos
    const { count: totalScans, error: countError } = await supabase
      .from("qr_scan_events")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error obteniendo el total de escaneos:", countError)
      return NextResponse.json({ error: "No se pudo obtener el total de escaneos" }, { status: 500 })
    }

    // 2. Obtener tasa de éxito (escaneos con resultado exitoso)
    const { count: successfulScans, error: successError } = await supabase
      .from("qr_scan_events")
      .select("*", { count: "exact", head: true })
      .eq("success", true)

    if (successError) {
      console.error("Error obteniendo escaneos exitosos:", successError)
      return NextResponse.json({ error: "No se pudo obtener la tasa de éxito" }, { status: 500 })
    }

    // 3. Obtener distribución por tipo de dispositivo
    const { data: deviceData, error: deviceError } = await supabase.from("qr_scan_events").select("device_info")

    if (deviceError) {
      console.error("Error obteniendo información de dispositivos:", deviceError)
      return NextResponse.json({ error: "No se pudo obtener la información de dispositivos" }, { status: 500 })
    }

    // Procesar tipos de dispositivos
    const deviceTypes: Record<string, number> = {}
    deviceData.forEach((item: QRScanEvent) => {
      const deviceInfo = item.device_info || {}
      const deviceType = deviceInfo.deviceType || "Desconocido"

      if (deviceTypes[deviceType]) {
        deviceTypes[deviceType]++
      } else {
        deviceTypes[deviceType] = 1
      }
    })

    // 4. Obtener los productos más escaneados
    const { data: productsData, error: productsError } = await supabase
      .from("qr_scan_events")
      .select("product_id, products(id, name)")
      .eq("success", true)
      .not("product_id", "is", null)

    if (productsError) {
      console.error("Error obteniendo productos escaneados:", productsError)
      return NextResponse.json({ error: "No se pudo obtener los productos más escaneados" }, { status: 500 })
    }

    // Procesar los productos más escaneados
    const productMap: Record<string, { id: string; name: string; scans: number }> = {}

    productsData?.forEach((item: any) => {
      if (item.product_id && item.products) {
        const productId = item.product_id
        const productName = item.products.name || "Producto sin nombre"

        if (productMap[productId]) {
          productMap[productId].scans++
        } else {
          productMap[productId] = {
            id: productId,
            name: productName,
            scans: 1,
          }
        }
      }
    })

    // Convertir el mapa a un array y ordenar por número de escaneos
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 10) // Top 10

    // 5. Obtener tendencia de escaneos en el tiempo (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: timeData, error: timeError } = await supabase
      .from("qr_scan_events")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())

    if (timeError) {
      console.error("Error obteniendo datos temporales:", timeError)
      return NextResponse.json({ error: "No se pudo obtener la tendencia temporal" }, { status: 500 })
    }

    // Procesar datos temporales
    const scansByDate: Record<string, number> = {}

    timeData.forEach((item: QRScanEvent) => {
      if (item.created_at) {
        // Formatear fecha como YYYY-MM-DD
        const date = new Date(item.created_at).toISOString().split("T")[0]

        if (scansByDate[date]) {
          scansByDate[date]++
        } else {
          scansByDate[date] = 1
        }
      }
    })

    // Construir respuesta
    const stats: QRScanStats = {
      totalScans: totalScans || 0,
      successRate: totalScans ? (successfulScans || 0) / totalScans : 0,
      deviceTypes,
      topProducts,
      scansByDate,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error procesando estadísticas de QR:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

