/**
 * Servicio centralizado para operaciones con productos
 */

import { createServerClient, executeWithTimeout, getBrowserClient } from "./supabase-client"
import type { Product } from "./db-schema"

/**
 * Obtiene todos los productos
 */
export async function getAllProducts(): Promise<{ products: Product[]; error: Error | null }> {
  try {
    const supabase = createServerClient()

    const { data, error } = await executeWithTimeout(
      supabase.from("products").select("*").order("name"),
      10000,
      "Obtener todos los productos",
    )

    if (error) {
      return { products: [], error: new Error(error.message) }
    }

    return { products: data || [], error: null }
  } catch (error) {
    console.error("Error getting all products:", error)
    return {
      products: [],
      error: error instanceof Error ? error : new Error("Error desconocido al obtener productos"),
    }
  }
}

/**
 * Obtiene un producto por ID o URL amigable
 */
export async function getProduct(id: string): Promise<{ product: Product | null; error: Error | null }> {
  try {
    const supabase = createServerClient()

    const { data: product, error } = await executeWithTimeout(
      supabase
        .from("products")
        .select("*")
        .or(`urlpage.eq.${id},id.eq.${id}`)
        .single(),
      5000,
      "Obtener producto por ID",
    )

    if (error) throw new Error("Obtener producto por ID", { cause: error })

    return { product, error: null }
  } catch (error) {
    console.error("Error getting product:", error)
    return { product: null, error: error as Error }
  }
}

/**
 * Obtiene productos por categoría
 */
export async function getProductsByCategory(category: string): Promise<{ products: Product[]; error: Error | null }> {
  try {
    const supabase = createServerClient()

    const { data, error } = await executeWithTimeout(
      supabase.from("products").select("*").eq("category", category).order("name"),
      5000,
      "Obtener productos por categoría",
    )

    if (error) {
      return { products: [], error: new Error(error.message) }
    }

    return { products: data || [], error: null }
  } catch (error) {
    console.error("Error getting products by category:", error)
    return {
      products: [],
      error: error instanceof Error ? error : new Error("Error desconocido al obtener productos por categoría"),
    }
  }
}

/**
 * Actualiza la URL amigable de un producto
 */
export async function updateProductUrl(
  productId: string,
  name: string,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = getBrowserClient()

    // Generar URL amigable
    let urlpage = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    // Limitar longitud
    if (urlpage.length > 50) {
      urlpage = urlpage.substring(0, 50)
    }

    // Añadir ID para garantizar unicidad
    urlpage = `${urlpage}-${productId}`

    // Actualizar el producto
    const { error } = await executeWithTimeout(
      supabase.from("products").update({ urlpage }).eq("id", productId),
      5000,
      "Actualizar URL de producto",
    )

    if (error) {
      return { success: false, error: new Error(error.message) }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error updating product URL:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Error desconocido al actualizar URL"),
    }
  }
}

/**
 * Genera URLs amigables para todos los productos que no tienen una
 */
export async function generateMissingProductUrls(): Promise<{ success: boolean; count: number; error: Error | null }> {
  try {
    const supabase = getBrowserClient()

    // Obtener productos sin URL amigable
    const { data: products, error: fetchError } = await executeWithTimeout(
      supabase.from("products").select("id, name").is("urlpage", null),
      10000,
      "Obtener productos sin URL",
    )

    if (fetchError) {
      return { success: false, count: 0, error: new Error(fetchError.message) }
    }

    if (!products || products.length === 0) {
      return { success: true, count: 0, error: null }
    }

    // Actualizar cada producto
    let successCount = 0

    for (const product of products) {
      const { success } = await updateProductUrl(product.id, product.name)
      if (success) successCount++
    }

    return {
      success: true,
      count: successCount,
      error: null,
    }
  } catch (error) {
    console.error("Error generating missing product URLs:", error)
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error : new Error("Error desconocido al generar URLs"),
    }
  }
}

