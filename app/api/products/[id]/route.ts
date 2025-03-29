/**
 * API para obtener detalles de un producto por ID
 */
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: "ID de producto no proporcionado" }, { status: 400 })
  }

  try {
    // Primero intentamos buscar por urlpage
    let { data: product, error } = await supabase.from("products").select("*").eq("urlpage", id).single()

    // Si no encontramos por urlpage, intentamos por id
    if (!product) {
      const result = await supabase.from("products").select("*").eq("id", id).single()
      product = result.data
      error = result.error
    }

    if (error) {
      throw error
    }

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error getting product:", error)
    return NextResponse.json({ error: "Error al obtener el producto" }, { status: 500 })
  }
} 