import { createBrowserClient, executeWithTimeout } from "./supabase-client"
import type { Product } from "./database.types"

/**
 * Obtiene todos los productos
 */
export async function getProducts(): Promise<Product[]> {
  const supabase = createBrowserClient()

  const { data, error } = await executeWithTimeout(
    supabase.from("products").select("*").order("name"),
    undefined,
    "obtener productos",
  )

  if (error) {
    console.error("Error fetching products:", error)
    throw new Error(`Error al obtener productos: ${error.message}`)
  }

  return data || []
}

/**
 * Obtiene un producto por su ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createBrowserClient()

  const { data, error } = await executeWithTimeout(
    supabase.from("products").select("*").eq("id", id).single(),
    undefined,
    "obtener producto por ID",
  )

  if (error) {
    console.error("Error fetching product by ID:", error)
    throw new Error(`Error al obtener producto: ${error.message}`)
  }

  return data
}

/**
 * Crea un nuevo producto
 */
export async function createProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
  const supabase = createBrowserClient()

  const { data, error } = await executeWithTimeout(
    supabase.from("products").insert([product]).select().single(),
    undefined,
    "crear producto",
  )

  if (error) {
    console.error("Error creating product:", error)
    throw new Error(`Error al crear producto: ${error.message}`)
  }

  return data
}

/**
 * Actualiza un producto existente
 */
export async function updateProduct(product: Partial<Product> & { id: string }): Promise<Product> {
  const supabase = createBrowserClient()

  const { data, error } = await executeWithTimeout(
    supabase.from("products").update(product).eq("id", product.id).select().single(),
    undefined,
    "actualizar producto",
  )

  if (error) {
    console.error("Error updating product:", error)
    throw new Error(`Error al actualizar producto: ${error.message}`)
  }

  return data
}

/**
 * Elimina un producto
 */
export async function deleteProduct(id: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await executeWithTimeout(
    supabase.from("products").delete().eq("id", id),
    undefined,
    "eliminar producto",
  )

  if (error) {
    console.error("Error deleting product:", error)
    throw new Error(`Error al eliminar producto: ${error.message}`)
  }
}

