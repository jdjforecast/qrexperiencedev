import { getSupabaseClient } from "@/lib/supabase/client"

export interface DeviceInfo {
  type: string
  os: string
  browser: string
  screenSize: string
}

export interface QRScanEvent {
  qr_code_id: string
  user_id?: string
  device_info?: DeviceInfo
  success: boolean
  action_taken: "scan" | "view" | "add_to_cart" | "error"
  error?: string
}

/**
 * Obtiene información del dispositivo actual
 * @returns DeviceInfo objeto con información del dispositivo
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      type: "server",
      os: "unknown",
      browser: "unknown",
      screenSize: "unknown",
    }
  }

  const ua = navigator.userAgent
  return {
    type: /Mobile|Tablet/i.test(ua) ? "mobile" : "desktop",
    os: getOS(ua),
    browser: getBrowser(ua),
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  }
}

function getOS(ua: string): string {
  if (/Windows/i.test(ua)) return "Windows"
  if (/Mac/i.test(ua)) return "MacOS"
  if (/Linux/i.test(ua)) return "Linux"
  if (/Android/i.test(ua)) return "Android"
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS"
  return "Unknown"
}

function getBrowser(ua: string): string {
  if (/Chrome/i.test(ua)) return "Chrome"
  if (/Firefox/i.test(ua)) return "Firefox"
  if (/Safari/i.test(ua)) return "Safari"
  if (/Edge/i.test(ua)) return "Edge"
  if (/Opera|OPR/i.test(ua)) return "Opera"
  return "Unknown"
}

/**
 * Registra un evento de escaneo de QR
 * @param event Información del evento de escaneo
 * @returns Objeto con el resultado de la operación
 */
export async function trackQRScan(event: QRScanEvent): Promise<void> {
  try {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from("qr_scan_events").insert([
      {
        qr_code_id: event.qr_code_id,
        user_id: event.user_id,
        device_info: event.device_info || getDeviceInfo(),
        success: event.success,
        action_taken: event.action_taken,
        error: event.error,
      },
    ])

    if (error) throw error
  } catch (error) {
    console.error("Error tracking QR scan:", error)
    // No lanzamos el error para no interrumpir el flujo principal
  }
}

