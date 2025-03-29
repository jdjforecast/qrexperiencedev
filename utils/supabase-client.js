export async function getProductById(productId) {
  try {
    // Consulta principal con manejo de errores mejorado
    const { data: product, error } = await supabase.from("products").select("*").eq("id", productId).single()

    if (error) {
      console.error("Error fetching product:", error)
      return { product: null, error }
    }

    // Si existe una tabla de imágenes separada
    if (product) {
      const { data: images, error: imagesError } = await supabase.from("images").select("*").eq("product_id", productId)

      if (!imagesError && images) {
        product.images = images
      } else {
        console.error("Error fetching product images:", imagesError)
        product.images = []
      }
    }

    return { product, error: null }
  } catch (error) {
    console.error("Unexpected error in getProductById:", error)
    return { product: null, error }
  }
}

