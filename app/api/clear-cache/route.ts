import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  // Limpiar todas las cookies relacionadas con Supabase
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()

  for (const cookie of allCookies) {
    if (cookie.name.includes("supabase") || cookie.name.includes("sb-")) {
      cookies().delete(cookie.name)
    }
  }

  // Establecer encabezados para evitar el almacenamiento en caché
  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}

