"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/components/auth/AuthProvider"
import { getAllProducts } from "@/lib/products"
import RouteGuard from "@/components/auth/route-guard"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  code: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        const result = await getAllProducts()

        if (result.success) {
          setProducts(result.data || [])
        } else {
          setError(result.error || "Error al cargar los productos")
        }
      } catch (err) {
        console.error("Error al cargar productos:", err)
        setError("Error inesperado al cargar los productos")
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  return (
    <RouteGuard requireAuth>
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">Catálogo de Productos</h1>

        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : products.length === 0 ? (
          <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">
            No hay productos disponibles en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="block overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:scale-105"
              >
                <div className="relative h-48 w-full">
                  {product.image_url ? (
                    <Image
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <span className="text-gray-500">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="mb-2 text-lg font-semibold">{product.name}</h2>
                  <p className="mb-2 text-sm text-gray-600">
                    {product.description
                      ? product.description.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description
                      : "Sin descripción"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                    <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {product.stock > 0 ? "En stock" : "Agotado"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  )
}

