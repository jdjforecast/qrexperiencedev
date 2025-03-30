import { getBrowserClient } from "@/lib/supabase-client-browser"

// Interfaces para los productos
export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  code: string
  urlpage?: string
  [key: string]: any
}

/**
 * Obtiene todos los productos
 */
export async function getAllProducts(): Promise<Product[]> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.from("products").select("*").order("name")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data as Product[]
}

/**
 * Obtiene un producto por su ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching product with ID ${id}:`, error)
    return null
  }

  return data as Product
}

/**
 * Obtiene un producto por su código
 */
export async function getProductByCode(code: string): Promise<Product | null> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.from("products").select("*").eq("code", code).single()

  if (error) {
    console.error(`Error fetching product with code ${code}:`, error)
    return null
  }

  return data as Product
}

/**
 * Obtiene un producto por su código QR
 */
export async function getProductByQRCode(
  qrCode: string,
): Promise<{ success: boolean; data?: { product: Product; coinsValue?: number }; error?: string }> {
  try {
    const product = await getProductByCode(qrCode)

    if (!product) {
      return {
        success: false,
        error: "Producto no encontrado para el código QR proporcionado",
      }
    }

    return {
      success: true,
      data: {
        product,
        coinsValue: 0, // Siempre 0 para esta implementación simple
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error al obtener el producto por código QR"
    console.error(errorMessage, error)
    return { success: false, error: errorMessage }
  }
}

/**
 * Crea un nuevo producto
 */
export async function createProduct(
  productData: Omit<Product, "id">,
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.from("products").insert(productData).select().single()

  if (error) {
    console.error("Error creating product:", error)
    return { success: false, error: error.message }
  }

  return { success: true, product: data as Product }
}

/**
 * Actualiza un producto existente
 */
export async function updateProduct(
  id: string,
  productData: Partial<Product>,
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.from("products").update(productData).eq("id", id).select().single()

  if (error) {
    console.error(`Error updating product with ID ${id}:`, error)
    return { success: false, error: error.message }
  }

  return { success: true, product: data as Product }
}

/**
 * Elimina un producto
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getBrowserClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error(`Error deleting product with ID ${id}:`, error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

