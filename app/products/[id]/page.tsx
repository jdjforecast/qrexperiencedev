import { notFound } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase-client-browser"
import ProductDetail from "./product-detail"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const product = await getBrowserClient.getProductById(params.id)

    if (!product) {
      return notFound()
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <ProductDetail product={product} />
      </div>
    )
  } catch (error) {
    console.error("Error loading product:", error)
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Error cargando el producto. Por favor intente nuevamente.</p>
      </div>
    )
  }
}

