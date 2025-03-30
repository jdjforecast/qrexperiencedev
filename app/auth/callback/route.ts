import { getServerClient } from "@/lib/supabase-client-server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Obtener la URL actual
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const next = requestUrl.searchParams.get("next") || "/dashboard"

    // Si no hay código, redirigir a la página de inicio
    if (!code) {
      return NextResponse.redirect(new URL("/", requestUrl.origin))
    }

    // Procesar el código de autenticación
    const cookieStore = cookies()
    const supabase = getServerClient({
      get: (name) => {
        const cookie = cookieStore.get(name)
        return { value: cookie?.value }
      },
    })

    // Intercambiar el código por una sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error al procesar el código de autenticación:", error)
      // Redirigir a la página de login con un mensaje de error
      return NextResponse.redirect(new URL("/login?error=Error+al+activar+la+cuenta", requestUrl.origin))
    }

    // Redirigir a la página de dashboard o a la especificada en next
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (error) {
    console.error("Error en la ruta de callback:", error)
    // Redirigir a la página de inicio en caso de error
    return NextResponse.redirect(new URL("/", new URL(request.url).origin))
  }
}

