"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import RouteGuard from "@/components/auth/route-guard"
import LoadingSpinner from "@/components/ui/loading-spinner"
import type { Product } from "@/types/product"
import { MostPurchasedChart } from "./most-purchased-chart"

export default function AdminProductsPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/products")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data: Product[] = await response.json()
        setProducts(data)
      } catch (err) {
        console.error("Error loading products from API:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleDeleteProduct = async (id: string) => {
    if (isDeleting) return

    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return
    }

    setIsDeleting(id)
    setError(null)

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || response.statusText || `HTTP error! status: ${response.status}`)
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      )

    } catch (err) {
      console.error("Error deleting product via API:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred during deletion")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <RouteGuard requireAuth requireAdmin>
      <div className="container mx-auto p-4 space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Administrar Productos</h1>
          <Link href="/admin/products/new" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Nuevo Producto
          </Link>
        </div>

        <MostPurchasedChart />

        {isLoading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">Error: {error}</div>
        ) : products.length === 0 ? (
          <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">
            No hay productos disponibles en este momento.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    SKU
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Precio
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Stock
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.sku || "-"}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">${product.price.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <Link href={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-900">
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isDeleting === product.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {isDeleting === product.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RouteGuard>
  )
}

