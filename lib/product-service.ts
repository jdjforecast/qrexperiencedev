/**
 * Servicio centralizado para operaciones con productos
 */

import { createBrowserClient } from "./supabase-client"
import { createServerClient } from "./auth"
import type { Product } from "./db-schema"
import { createClientClient } from "@/lib/supabase/client"
import { ProductData } from "@/types/cart"
import { ProductDataSchema } from "@/types/schemas"

/**
 * Obtiene todos los productos
 */
export async function getAllProducts(): Promise<{ products: Product[]; error: Error | null }> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("products").select("*").order("name")

    if (error) {
      console.error("Error getting all products:", error.message)
      return { products: [], error: new Error(error.message) }
    }

    return { products: data || [], error: null }
  } catch (error) {
    console.error("Unhandled error getting all products:", error)
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
    const supabase = await createServerClient()
    const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .or(`urlpage.eq.${id},id.eq.${id}`)
        .single()

    if (error) {
        console.error("Error getting product by ID:", error.message)
        if (error.code === 'PGRST116') {
             console.log(`Product not found for id/url: ${id}`)
             return { product: null, error: null }
        }
        return { product: null, error: new Error(error.message) }
    }

    return { product, error: null }
  } catch (error) {
    console.error("Unhandled error getting product:", error)
    return { product: null, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * Obtiene productos por categoría
 */
export async function getProductsByCategory(category: string): Promise<{ products: Product[]; error: Error | null }> {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("products").select("*").eq("category", category).order("name")

    if (error) {
      console.error("Error getting products by category:", error.message)
      return { products: [], error: new Error(error.message) }
    }

    return { products: data || [], error: null }
  } catch (error) {
    console.error("Unhandled error getting products by category:", error)
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
    const supabase = createBrowserClient()

    let urlpage = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    if (urlpage.length > 50) {
      urlpage = urlpage.substring(0, 50)
    }
    const shortId = productId.split('-')[0]
    urlpage = `${urlpage}-${shortId}`

    const { error } = await supabase.from("products").update({ urlpage }).eq("id", productId)

    if (error) {
      console.error("Error updating product URL:", error.message)
      return { success: false, error: new Error(error.message) }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Unhandled error updating product URL:", error)
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
    const supabase = createBrowserClient()

    const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("id, name")
        .is("urlpage", null)

    if (fetchError) {
      console.error("Error fetching products without URL:", fetchError.message)
      return { success: false, count: 0, error: new Error(fetchError.message) }
    }

    if (!products || products.length === 0) {
      console.log("No products found missing URLs.")
      return { success: true, count: 0, error: null }
    }

    console.log(`Found ${products.length} products missing URLs. Generating...`)

    let successCount = 0
    let errorOccurred = false
    let firstError: Error | null = null

    for (const product of products) {
        const result = await updateProductUrl(product.id, product.name)
        if (result.success) {
            successCount++
        } else {
            errorOccurred = true
            if (!firstError && result.error) {
                firstError = result.error
            }
            console.error(`Failed to update URL for product ${product.id}: ${result.error?.message}`)
        }
    }

     console.log(`Successfully updated URLs for ${successCount} out of ${products.length} products.`)

    return {
      success: !errorOccurred,
      count: successCount,
      error: firstError,
    }
  } catch (error) {
    console.error("Unhandled error generating missing product URLs:", error)
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error : new Error("Error desconocido al generar URLs"),
    }
  }
}

/**
 * Obtiene un producto por ID o URL amigable (Client-side)
 * Uses shared ProductData type and Zod validation.
 */
export async function getProductClientSide(idOrUrl: string): Promise<ProductFetchResult> {
  const supabase = createClientClient()
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, image_url, stock") // Select fields for ProductData
      .or(`urlpage.eq.${idOrUrl},id.eq.${idOrUrl}`)
      .single()

    if (error) {
      // Handle product not found specifically
      if (error.code === 'PGRST116') { 
        console.log(`Product not found client-side for id/url: ${idOrUrl}`)
        return { success: false, error: "Producto no encontrado", productNotFound: true }
      }
      // Handle other database errors
      console.error("Error getting product client-side:", error)
      return { success: false, error: error.message }
    }

    // Validate the fetched data
    const validationResult = ProductDataSchema.safeParse(data)
    if (!validationResult.success) {
      console.error("Zod validation failed for getProductClientSide:", validationResult.error.errors)
      return { success: false, error: "Error: Datos de producto inválidos recibidos del servidor." }
    }

    // Return validated data
    return { success: true, data: validationResult.data }

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error inesperado al obtener el producto"
    console.error("Unexpected error in getProductClientSide:", err)
    return { success: false, error: errorMessage }
  }
}

// Define result type for client-side fetch
type ProductFetchResult = 
  | { success: true; data: ProductData }
  | { success: false; error: string; productNotFound?: boolean }

