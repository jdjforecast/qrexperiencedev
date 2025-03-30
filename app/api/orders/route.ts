import { NextResponse } from "next/server"
import { createServerClient, isUserAdmin } from "@/lib/auth/server" // Usar helpers de auth
import { AdminOrdersArraySchema } from "@/types/schemas" // Importar schema Zod

export async function GET(request: Request) {
  try {
    // 1. Autenticación y Autorización
    const supabase = await createServerClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("API GET /api/orders: Error getting Supabase session:", sessionError)
      return NextResponse.json({ error: "Error checking authentication" }, { status: 500 })
    }
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Obtener datos de pedidos (consulta adaptada de lib/admin.ts)
    const { data, error } = await supabase
      .from("orders")
      .select(`
        order_id,
        created_at,
        status,
        total_amount,
        user:user_id(email, full_name),
        order_items (
          quantity,
          price,
          products ( // Corregir referencia a tabla products
            id, 
            name,
            price,
            image_url,
            stock
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("API GET /api/orders: Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // 3. Validar datos con Zod
    const validationResult = AdminOrdersArraySchema.safeParse(data)
    if (!validationResult.success) {
      console.error("API GET /api/orders: Zod validation failed:", validationResult.error.errors)
      // Es un error del servidor si los datos de la DB no coinciden con el schema
      return NextResponse.json({ error: "Invalid order data received from database." }, { status: 500 })
    }

    // 4. Devolver datos validados
    return NextResponse.json(validationResult.data)
  } catch (error) {
    console.error("API GET /api/orders: Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

