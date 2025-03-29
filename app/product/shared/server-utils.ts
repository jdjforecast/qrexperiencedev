import { createServerClient } from "@/lib/supabase/server"
import type { ProductWithImages } from "./types"

export async function getProductById(id: string): Promise<{ product: ProductWithImages | null; error: Error | null }> {
  const supabase = createServerClient()

  try {
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          id, 
          url
        )
      `)
      .eq("id", id)
      .single<ProductWithImages>()

    if (error) {
      return { product: null, error }
    }

    return { product, error: null }
  } catch (error) {
    return { product: null, error: error as Error }
  }
}

export async function getProductByUrlPage(
  urlpage: string,
): Promise<{ product: ProductWithImages | null; error: Error | null }> {
  const supabase = createServerClient()

  try {
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          id, 
          url
        )
      `)
      .eq("urlpage", urlpage)
      .eq("active", true)
      .single<ProductWithImages>()

    if (error) {
      return { product: null, error }
    }

    return { product, error: null }
  } catch (error) {
    return { product: null, error: error as Error }
  }
}

export async function checkProductQR(productId: string): Promise<boolean> {
  const supabase = createServerClient()

  try {
    const { data: qrInfo } = await supabase.from("qr_codes").select("id").eq("product_id", productId).limit(1)

    return qrInfo && qrInfo.length > 0
  } catch (error) {
    console.error("Error checking product QR:", error)
    return false
  }
}

export async function getProductsWithoutUrlPage(): Promise<{ products: ProductWithImages[]; error: Error | null }> {
  const supabase = createServerClient()

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          id, 
          url
        )
      `)
      .is("urlpage", null)
      .eq("active", true)

    if (error) {
      return { products: [], error }
    }

    return { products: products || [], error: null }
  } catch (error) {
    return { products: [], error: error as Error }
  }
}

export async function generateUrlPage(product: ProductWithImages): Promise<string> {
  // Crear URL amigable basada en el nombre del producto
  const baseUrl = product.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales con guiones
    .replace(/(^-|-$)/g, "") // Eliminar guiones al inicio y final

  // Agregar ID único al final para evitar colisiones
  return `${baseUrl}-${product.id.slice(0, 8)}`
}

export async function updateProductUrlPage(productId: string, urlpage: string): Promise<{ error: Error | null }> {
  const supabase = createServerClient()

  try {
    const { error } = await supabase.from("products").update({ urlpage }).eq("id", productId)

    return { error }
  } catch (error) {
    return { error: error as Error }
  }
}

