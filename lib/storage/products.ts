import { createClientClient } from "@/lib/supabase/client"
import { createServerClient } from "../supabase"
import type { Product } from "@/types/product"
import { NewProductSchema } from "@/types/schemas"
import type { z } from "zod"

// Crear un nuevo producto
export async function createProduct(productData: z.input<typeof NewProductSchema>) {
  const validation = NewProductSchema.safeParse(productData)
  if (!validation.success) {
    console.error("Internal Validation Failed (createProduct):", validation.error.errors)
    return { data: null, error: new Error("Datos de producto inválidos internamente.") }
  }
  const validatedData = validation.data

  try {
    const supabase = createServerClient()

    if (!validatedData || !validatedData.name) {
      return {
        data: null,
        error: new Error("Datos de producto inválidos o incompletos"),
      }
    }

    console.log(`Creando nuevo producto: ${validatedData.name}`)

    const { data, error } = await supabase.from("products").insert(validatedData).select().single()

    if (error) {
      console.error("Error al crear producto:", error)
      return { data: null, error }
    }

    console.log(`Producto creado con éxito: ${data.id}`)
    return { data, error: null }
  } catch (error) {
    console.error("Error crítico al crear producto:", error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Error desconocido al crear producto"),
    }
  }
}

// Obtener todos los productos
export async function getAllProducts() {
  try {
    const supabase = createClientClient()
    console.log("Obteniendo lista de productos")

    const { data, error } = await supabase.from("products").select("*").order("name")

    if (error) {
      console.error("Error al obtener productos:", error)
      return { data: [], error }
    }

    console.log(`Obtenidos ${data?.length || 0} productos`)
    return { data: data || [], error: null }
  } catch (error) {
    console.error("Error crítico al obtener productos:", error)
    return {
      data: [],
      error: error instanceof Error ? error : new Error("Error desconocido al obtener productos"),
    }
  }
}

// Obtener productos por categoría
export async function getProductsByCategory(category: string) {
  try {
    if (!category) {
      return { data: [], error: new Error("Categoría no especificada") }
    }

    const supabase = createClientClient()
    console.log(`Obteniendo productos de categoría: ${category}`)

    const { data, error } = await supabase.from("products").select("*").eq("category", category).order("name")

    if (error) {
      console.error(`Error al obtener productos de categoría ${category}:`, error)
      return { data: [], error }
    }

    console.log(`Obtenidos ${data?.length || 0} productos de categoría ${category}`)
    return { data: data || [], error: null }
  } catch (error) {
    console.error(`Error crítico al obtener productos de categoría ${category}:`, error)
    return {
      data: [],
      error: error instanceof Error ? error : new Error("Error desconocido al obtener productos por categoría"),
    }
  }
}

// Obtener un producto por ID
export async function getProductById(id: string) {
  try {
    if (!id) {
      return { data: null, error: new Error("ID de producto no especificado") }
    }

    const supabase = createClientClient()
    console.log(`Obteniendo producto con ID: ${id}`)

    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error)
      return { data: null, error }
    }

    if (!data) {
      console.log(`No se encontró producto con ID ${id}`)
      return { data: null, error: new Error("Producto no encontrado") }
    }

    console.log(`Producto obtenido: ${data.name}`)
    return { data, error: null }
  } catch (error) {
    console.error(`Error crítico al obtener producto con ID ${id}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Error desconocido al obtener producto"),
    }
  }
}

// Actualizar un producto
export async function updateProduct(id: string, updates: Partial<Product>) {
  try {
    if (!id) {
      return { data: null, error: new Error("ID de producto no especificado") }
    }

    if (Object.keys(updates).length === 0) {
      return { data: null, error: new Error("No se proporcionaron datos para actualizar") }
    }

    const supabase = createServerClient()
    console.log(`Actualizando producto con ID: ${id}`)

    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()

    if (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error)
      return { data: null, error }
    }

    if (!data) {
      console.log(`No se encontró producto con ID ${id} para actualizar`)
      return { data: null, error: new Error("Producto no encontrado") }
    }

    console.log(`Producto actualizado: ${data.name}`)
    return { data, error: null }
  } catch (error) {
    console.error(`Error crítico al actualizar producto con ID ${id}:`, error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Error desconocido al actualizar producto"),
    }
  }
}

// Eliminar un producto
export async function deleteProduct(id: string) {
  try {
    if (!id) {
      return { error: new Error("ID de producto no especificado") }
    }

    const supabase = createServerClient()
    console.log(`Eliminando producto con ID: ${id}`)

    // Primero verificamos si el producto existe
    const { data: product } = await supabase.from("products").select("name").eq("id", id).single()

    if (!product) {
      console.log(`No se encontró producto con ID ${id} para eliminar`)
      return { error: new Error("Producto no encontrado") }
    }

    // Eliminamos los QR asociados si existen
    await supabase.from("qr_codes").delete().eq("product_id", id)

    // Ahora eliminamos el producto
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error(`Error al eliminar producto con ID ${id}:`, error)
      return { error }
    }

    console.log(`Producto eliminado con éxito: ${id}`)
    return { error: null }
  } catch (error) {
    console.error(`Error crítico al eliminar producto con ID ${id}:`, error)
    return {
      error: error instanceof Error ? error : new Error("Error desconocido al eliminar producto"),
    }
  }
}

// Subir imagen de producto
export async function uploadProductImage(file: File, productId: string) {
  try {
    if (!file || !productId) {
      return {
        data: null,
        error: new Error("Archivo o ID de producto no especificado"),
      }
    }

    // Verificar tamaño y tipo de archivo
    if (file.size > 5 * 1024 * 1024) {
      // 5MB límite
      return {
        data: null,
        error: new Error("El archivo es demasiado grande (máximo 5MB)"),
      }
    }

    if (!file.type.startsWith("image/")) {
      return {
        data: null,
        error: new Error("El archivo debe ser una imagen"),
      }
    }

    const supabase = createClientClient()
    console.log(`Subiendo imagen para producto ID: ${productId}`)

    // Crear un nombre único para el archivo
    const fileExt = file.name.split(".").pop()
    const fileName = `${productId}_${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Subir el archivo
    const { data, error } = await supabase.storage.from("products").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error(`Error al subir imagen para producto ${productId}:`, error)

      // Intentar con bucket alternativo si hay error
      try {
        console.log("Intentando con bucket alternativo 'images'")
        const { data: altData, error: altError } = await supabase.storage.from("images").upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

        if (altError) {
          console.error("Error también en bucket alternativo:", altError)
          return { data: null, error }
        }

        // Si se subió correctamente en el bucket alternativo
        const { data: altUrlData } = supabase.storage.from("images").getPublicUrl(filePath)

        if (!altUrlData || !altUrlData.publicUrl) {
          return { data: null, error: new Error("No se pudo obtener la URL de la imagen") }
        }

        console.log(`Imagen subida a bucket alternativo: ${altUrlData.publicUrl.substring(0, 50)}...`)

        // Actualizar el producto con la URL de la imagen
        const { data: updatedProduct, error: updateError } = await supabase
          .from("products")
          .update({ image_url: altUrlData.publicUrl })
          .eq("id", productId)
          .select()
          .single()

        return { data: updatedProduct, error: updateError }
      } catch (altBucketError) {
        console.error("Error crítico en intento alternativo:", altBucketError)
        return { data: null, error }
      }
    }

    // Obtener la URL pública
    const { data: urlData } = supabase.storage.from("products").getPublicUrl(data?.path || filePath)

    if (!urlData || !urlData.publicUrl) {
      return { data: null, error: new Error("No se pudo obtener la URL de la imagen") }
    }

    console.log(`Imagen subida exitosamente: ${urlData.publicUrl.substring(0, 50)}...`)

    // Actualizar el producto con la URL de la imagen
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({ image_url: urlData.publicUrl })
      .eq("id", productId)
      .select()
      .single()

    if (updateError) {
      console.error(`Error al actualizar producto con URL de imagen:`, updateError)
    } else {
      console.log(`Producto actualizado con nueva imagen: ${productId}`)
    }

    return { data: updatedProduct, error: updateError }
  } catch (error) {
    console.error(`Error crítico al subir imagen de producto:`, error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Error desconocido al subir imagen"),
    }
  }
}

/**
 * Función que construye URL para imágenes de producto, usando la carpeta local si es necesario
 * @param imageUrl URL original de la imagen (de Supabase)
 * @param productId ID del producto para fallback
 * @returns URL segura para la imagen
 */
export function getProductImageUrl(imageUrl: string | null | undefined, productId: string): string {
  // Si tenemos una URL válida de Supabase, usarla
  if (imageUrl && imageUrl.trim() !== "") {
    return imageUrl
  }

  // Fallback a la carpeta local /public/productimgs
  return `/productimgs/${productId}.png`
}

/**
 * Genera una URL amigable para SEO a partir del nombre del producto
 * @param name Nombre del producto
 * @param id ID del producto para garantizar unicidad
 * @returns URL amigable
 */
export function generateFriendlyUrl(name: string, id: string): string {
  if (!name) return id

  // Convertir a minúsculas
  let url = name.toLowerCase()

  // Reemplazar caracteres especiales con guiones
  url = url.replace(/[^a-z0-9]+/g, "-")

  // Eliminar guiones múltiples
  url = url.replace(/-+/g, "-")

  // Eliminar guiones al inicio y final
  url = url.replace(/^-|-$/g, "")

  // Limitar longitud a 50 caracteres para evitar URLs muy largas
  if (url.length > 50) {
    url = url.substring(0, 50)
  }

  // Añadir el ID al final para garantizar unicidad
  return `${url}-${id}`
}

/**
 * Actualiza la URL amigable de un producto
 * @param productId ID del producto
 * @param name Nombre del producto
 * @returns Resultado de la operación
 */
export async function updateProductUrl(productId: string, name: string) {
  try {
    const supabase = createClientClient()

    // Generar URL amigable
    const friendlyUrl = generateFriendlyUrl(name, productId)

    // Actualizar el producto
    const { data, error } = await supabase
      .from("products")
      .update({ urlpage: friendlyUrl })
      .eq("id", productId)
      .select("urlpage")
      .single()

    if (error) {
      console.error("Error actualizando URL del producto:", error)
      return { success: false, error }
    }

    return {
      success: true,
      urlpage: data.urlpage,
      message: "URL actualizada correctamente",
    }
  } catch (error) {
    console.error("Error en updateProductUrl:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      message: "Error actualizando URL del producto",
    }
  }
}

