"use client"

import { useEffect, useState } from "react"
import { getProductsWithoutUrlPage, generateUrlPage, updateProductUrlPage } from "@/app/product/shared/client-utils"
import type { ProductWithImages } from "@/app/product/shared/types"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

export default function ProductUrlsPage() {
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const { products, error } = await getProductsWithoutUrlPage()
      if (error) throw error
      setProducts(products)
    } catch (error) {
      console.error("Error loading products:", error)
      toast.error("Error al cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateUrl(product: ProductWithImages) {
    setUpdating(product.id)
    try {
      const urlpage = await generateUrlPage(product)
      const { error } = await updateProductUrlPage(product.id, urlpage)

      if (error) throw error

      toast.success("URL generada correctamente")
      setProducts(products.filter((p) => p.id !== product.id))
    } catch (error) {
      console.error("Error generating URL:", error)
      toast.error("Error al generar la URL")
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Cargando productos...</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestionar URLs de Productos</h1>

      {products.length === 0 ? (
        <p className="text-green-600">¡Todos los productos tienen su URL amigable!</p>
      ) : (
        <div className="space-y-4">
          <p className="text-yellow-600">{products.length} productos sin URL amigable</p>

          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500">ID: {product.id}</p>
                </div>

                <Button onClick={() => handleGenerateUrl(product)} disabled={updating === product.id}>
                  {updating === product.id ? "Generando..." : "Generar URL"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

