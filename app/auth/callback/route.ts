import { createServerClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Obtener la URL actual
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    // Si no hay código, redirigir a la página de inicio
    if (!code) {
      return NextResponse.redirect(new URL("/", requestUrl.origin))
    }

    // Procesar el código de autenticación
    const supabase = createServerClient()

    // Intercambiar el código por una sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error al procesar el código de autenticación:", error)
      // Redirigir a la página de login con un mensaje de error
      return NextResponse.redirect(new URL("/login?error=Error+al+activar+la+cuenta", requestUrl.origin))
    }

    // Redirigir a la página de dashboard o inicio después de la autenticación exitosa
    return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
  } catch (error) {
    console.error("Error en la ruta de callback:", error)
    // Redirigir a la página de inicio en caso de error
    return NextResponse.redirect(new URL("/", request.url))
  }
}

