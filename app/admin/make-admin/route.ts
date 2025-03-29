import { createServerClient } from "@/lib/supabase-client"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Se requiere un correo electrónico" }, { status: 400 })
    }

    const supabase = createServerClient({ admin: true })

    // Buscar el usuario por correo electrónico
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      console.error("Error al buscar usuarios:", userError)
      return NextResponse.json({ error: `Error al buscar usuarios: ${userError.message}` }, { status: 500 })
    }

    // Encontrar el usuario con el correo electrónico especificado
    const user = userData.users.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: `No se encontró ningún usuario con el correo electrónico ${email}` },
        { status: 404 },
      )
    }

    // Verificar si el usuario ya tiene un perfil
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Error al verificar el perfil:", profileError)
      return NextResponse.json({ error: `Error al verificar el perfil: ${profileError.message}` }, { status: 500 })
    }

    // Si el perfil existe, actualizarlo; si no, crearlo
    let result
    if (profileData) {
      // El perfil existe, actualizarlo
      result = await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id)
    } else {
      // El perfil no existe, crearlo
      result = await supabase.from("profiles").insert({ id: user.id, role: "admin" })
    }

    if (result.error) {
      console.error("Error al actualizar/crear el perfil:", result.error)
      return NextResponse.json(
        { error: `Error al actualizar/crear el perfil: ${result.error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `El usuario ${email} ahora es administrador`,
      userId: user.id,
    })
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

