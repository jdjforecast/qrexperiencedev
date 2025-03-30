import { NextResponse } from "next/server"
import { createProduct, getAllProducts } from "@/lib/products"
import { getServerClient } from "@/lib/supabase-client-server"

// GET Handler to fetch all products (Admin only)
export async function GET(request: Request) {
  try {
    // Verificar autenticación con Supabase
    const supabase = getServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar si es admin
    const { data: profileData } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profileData || profileData.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener todos los productos
    const products = await getAllProducts()

    // Retornar los productos
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error in GET /api/products:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación con Supabase
    const supabase = getServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar si es admin
    const { data: profileData } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (!profileData || profileData.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Obtener datos del producto
    let productData
    try {
      productData = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ error: "Request body inválido (no es JSON)" }, { status: 400 })
    }

    // Validar campos mínimos requeridos
    if (!productData.name || !productData.price) {
      return NextResponse.json({ error: "Faltan campos requeridos (nombre y precio)" }, { status: 400 })
    }

    // Generar código si no existe
    if (!productData.code) {
      productData.code = Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    // Crear producto
    const result = await createProduct(productData)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Error al crear el producto" }, { status: 500 })
    }

    // Retornar el producto creado
    return NextResponse.json(result.product, { status: 201 })
  } catch (error) {
    console.error("Error en POST /api/products:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

