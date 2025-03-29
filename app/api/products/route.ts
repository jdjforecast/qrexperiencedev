import { NextResponse } from "next/server"
import { createProduct, getAllProducts } from "@/lib/storage/products"
import { getCurrentUser, isUserAdmin } from "@/lib/auth/server-api"
import { NewProductSchema, ProductSchema } from "@/types/schemas"
import type { Product } from "@/types/product"
import { z } from "zod"

// GET Handler to fetch all products (Admin only)
export async function GET(request: Request) {
  try {
    // Obtener usuario actual usando la request
    const user = await getCurrentUser(request);

    // Verificar si el usuario está autenticado
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 1. Authentication & Authorization
    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Fetch products using the storage function
    const { data: products, error: fetchError } = await getAllProducts()

    if (fetchError) {
      console.error("Error fetching products via storage:", fetchError)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // 3. Validate the fetched data (optional but good practice)
    // Use zod array validation
    const validation = z.array(ProductSchema).safeParse(products)
    if (!validation.success) {
      console.error("Fetched product data validation failed:", validation.error)
      // Decide response: return potentially invalid data, empty array, or error?
      // Returning error for now to indicate server-side data issue.
      return NextResponse.json({ error: "Product data from storage is invalid" }, { status: 500 })
    }

    // 4. Return validated products
    return NextResponse.json(validation.data)

  } catch (error) {
    console.error("Error in GET /api/products:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos de admin
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: "Se requieren permisos de administrador" }, { status: 403 })
    }

    // Obtener datos del producto
    let productDataJson;
    try {
      productDataJson = await request.json();
    } catch (jsonError) {
      return NextResponse.json({ error: "Request body inválido (no es JSON)" }, { status: 400 })
    }
    
    const validationResult = NewProductSchema.safeParse(productDataJson);

    if (!validationResult.success) {
      // Log detailed validation errors for debugging
      console.error("Product validation failed:", validationResult.error.errors);
      // Return a user-friendly error message
      return NextResponse.json(
        {
          error: "Datos de producto inválidos. Verifique los campos requeridos.", 
          // Optionally include field-specific errors for client-side forms
          // issues: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    // Use validated data to create the product
    const validatedInput = validationResult.data;

    // Convert null values to undefined before passing to createProduct
    const productDataForCreation: Omit<Product, "id" | "created_at"> = {}
    for (const key in validatedInput) {
      if (Object.prototype.hasOwnProperty.call(validatedInput, key)) {
        const value = validatedInput[key as keyof typeof validatedInput];
        if (value !== null) {
          productDataForCreation[key as keyof Omit<Product, "id" | "created_at">] = value;
        }
        // else: null values are omitted, effectively becoming undefined
      }
    }

    const { data: createdProduct, error: creationError } = await createProduct(productDataForCreation);

    if (creationError) {
      console.error("Error calling createProduct:", creationError);
      return NextResponse.json({ error: creationError.message || "Error creando producto" }, { status: 500 })
    }

    // Return the created product (potentially re-validate response? depends on createProduct)
    return NextResponse.json(createdProduct, { status: 201 }); // Use 201 Created status

  } catch (error) {
    console.error("Error en POST /api/products:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

