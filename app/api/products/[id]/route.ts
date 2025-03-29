/**
 * API para obtener detalles de un producto por ID
 */
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, isUserAdmin } from "@/lib/auth"
// Adjust import: Use getProduct from service for GET
import { getProduct } from "@/lib/product-service"
import { updateProduct, deleteProduct, getProductById } from "@/lib/storage/products"
import { ProductSchema } from "@/types/schemas"
import type { Product } from "@/types/product"

// Remove Supabase client imports if getProduct handles its own client
// import { cookies } from "next/headers"
// import { createClient, type CookieOptions } from "@supabase/ssr"

// GET Handler (Kept as previously refactored using product-service)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  try {
    const { product, error } = await getProduct(id)

    if (error) {
      console.error(`Error fetching product ${id}:`, error)
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to fetch product details" }, { status: 500 })
    }

    // Validate the product data before returning
    const validation = ProductSchema.safeParse(product)
    if (!validation.success) {
      console.error(`Product data validation failed for ID ${id}:`, validation.error)
      // Decide if we should still return the product or an error
      return NextResponse.json({ error: "Product data is invalid on the server" }, { status: 500 })
    }

    return NextResponse.json(validation.data)

  } catch (error) {
    console.error(`Unexpected error in GET /api/products/${id}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT Handler for updating a product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  try {
    // 1. Authentication & Authorization
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting Supabase session:", sessionError)
      return NextResponse.json({ error: "Error checking authentication" }, { status: 500 })
    }
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Parse Request Body
    let updateData: unknown;
    try {
      updateData = await request.json()
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    // 3. Validate Update Data (Partial)
    const validation = ProductSchema.partial().safeParse(updateData)

    if (!validation.success) {
      console.error("Update validation failed:", validation.error.errors);
      return NextResponse.json({ error: "Invalid product data", details: validation.error.flatten().fieldErrors }, { status: 400 })
    }

    // Ensure we don't try to update id or created_at
    const { id: _, created_at: __, ...validatedInput } = validation.data

    // Convert null values to undefined to match Partial<Product> expectations
    // Using `any` temporarily to bypass strict assignment check
    const validatedUpdates: any = {}
    for (const key in validatedInput) {
      if (Object.prototype.hasOwnProperty.call(validatedInput, key)) {
        const value = validatedInput[key as keyof typeof validatedInput];
        if (value !== null) { // Only include non-null values
           // Assign directly using the key
          validatedUpdates[key] = value;
        } else {
          // Explicitly set to undefined if you want to clear the field via update
          // Or omit the key if null means "do not update this field"
          // Omitting for now, assuming null means no change intended.
        }
      }
    }

    if (Object.keys(validatedUpdates).length === 0) {
        return NextResponse.json({ error: "No valid fields provided for update (after null check)" }, { status: 400 });
    }

    // 4. Call Service Function
    const { data: updatedProduct, error: updateError } = await updateProduct(id, validatedUpdates)

    if (updateError) {
      console.error(`Error updating product ${id}:`, updateError)
      if (updateError.message.includes("not found")) {
          return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    // 5. Return Response
    return NextResponse.json(updatedProduct)

  } catch (error) {
    console.error(`Unexpected error in PUT /api/products/${id}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE Handler for deleting a product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  try {
    // 1. Authentication & Authorization
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting Supabase session:", sessionError)
      return NextResponse.json({ error: "Error checking authentication" }, { status: 500 })
    }
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Call Service Function
    const { error: deleteError } = await deleteProduct(id)

    if (deleteError) {
      console.error(`Error deleting product ${id}:`, deleteError)
      if (deleteError.message.includes("not found")) {
          return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }

    // 3. Return Response
    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 })

  } catch (error) {
    console.error(`Unexpected error in DELETE /api/products/${id}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 