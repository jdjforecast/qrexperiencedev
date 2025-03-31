"use client"

import { useState } from "react"
import Link from "next/link"
import { getBrowserClient } from "@/lib/supabase-client-browser"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  created_at: string
}

interface ProductsListProps {
  initialProducts: Product[]
}

export default function ProductsList({ initialProducts }: ProductsListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshProducts = async () => {
    try {
      setLoading(true)
      const supabase = getBrowserClient()

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, stock, created_at")
        .order("created_at", { ascending: false })

      if (error) throw error

      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Link href="/admin/products/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </Link>
        <Button onClick={refreshProducts} disabled={loading} variant="outline">
          {loading ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Nombre</th>
                <th className="py-2 px-4 border-b text-left">Categoría</th>
                <th className="py-2 px-4 border-b text-left">Precio</th>
                <th className="py-2 px-4 border-b text-left">Stock</th>
                <th className="py-2 px-4 border-b text-left">Fecha</th>
                <th className="py-2 px-4 border-b text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{product.name}</td>
                  <td className="py-2 px-4 border-b">{product.category}</td>
                  <td className="py-2 px-4 border-b">{product.price} monedas</td>
                  <td className="py-2 px-4 border-b">{product.stock}</td>
                  <td className="py-2 px-4 border-b">{new Date(product.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex space-x-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

