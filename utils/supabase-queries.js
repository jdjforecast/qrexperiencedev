export async function getProductById(supabase, productId) {
  if (!productId) {
    console.error("ID de producto no proporcionado")
    return { product: null, error: "ID de producto requerido" }
  }

  try {
    const { data, error } = await supabase.from("products").select("*").eq("id", productId).single()

    if (error) {
      console.error("Error Supabase:", error)
      return { product: null, error }
    }

    return { product: data, error: null }
  } catch (error) {
    console.error("Error inesperado:", error)
    return { product: null, error }
  }
}

