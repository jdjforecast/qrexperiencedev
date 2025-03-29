import { NextResponse } from "next/server"
import { createProduct } from "@/lib/storage/products"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos de admin
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: "Se requieren permisos de administrador" }, { status: 403 })
    }

    // Obtener datos del producto
    const productData = await request.json()

    if (!productData || !productData.name) {
      return NextResponse.json({ error: "Datos de producto inválidos" }, { status: 400 })
    }

    // Crear el producto
    const { data, error } = await createProduct(productData)

    if (error) {
      return NextResponse.json({ error: error.message || "Error creando producto" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error en endpoint de creación de producto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

