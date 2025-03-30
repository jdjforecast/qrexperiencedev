import { getBrowserClient } from "@/lib/supabase-client-browser"

/**
 * Obtiene un producto por su ID desde la base de datos
 * @param id ID del producto a obtener
 * @returns El producto encontrado o null si no existe
 */
export async function getProductById(id: string) {
  try {
    const supabase = getBrowserClient()

    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error("Error obteniendo producto:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error inesperado obteniendo producto:", error)
    return null
  }
}

/**
 * Obtiene todos los productos disponibles
 * @returns Lista de productos
 */
export async function getAllProducts() {
  try {
    const supabase = getBrowserClient()

    const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error obteniendo productos:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error inesperado obteniendo productos:", error)
    return []
  }
}

/**
 * Crea un nuevo producto en la base de datos
 * @param product Datos del producto a crear
 * @returns El producto creado o null si hubo un error
 */
export async function createProduct(product: any) {
  try {
    const supabase = getBrowserClient()

    const { data, error } = await supabase.from("products").insert([product]).select().single()

    if (error) {
      console.error("Error creando producto:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error inesperado creando producto:", error)
    return null
  }
}

