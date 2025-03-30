import { dataAPI } from "@/lib/supabase"
import ProductList from "./product-list"

export default async function ProductsPage() {
  try {
    const products = await dataAPI.getAllProducts()

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Our Products</h1>
        <ProductList products={products} />
      </div>
    )
  } catch (error) {
    console.error("Error loading products:", error)
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Our Products</h1>
        <p className="text-red-500">Error loading products. Please try again later.</p>
      </div>
    )
  }
}

