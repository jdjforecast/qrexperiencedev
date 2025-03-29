"use client"

import { useEffect, useState } from "react"
import { getBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ExternalLink, AlertCircle } from "lucide-react"

interface Product {
  id: string
  name: string
  urlpage: string
  active: boolean
  price: number
  stock: number
  image_url: string
  product_url: string
}

export default function VerifyProductPages() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          urlpage,
          active,
          price,
          stock,
          image_url
        `)
        .order("name")

      if (error) throw error

      // Añadir la URL completa a cada producto
      const productsWithUrls = data.map((product) => ({
        ...product,
        product_url: getProductUrl(product),
      }))

      setProducts(productsWithUrls)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando los productos")
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyPage = async (url: string) => {
    try {
      const response = await fetch(url, { method: "HEAD" })
      return response.ok
    } catch (error) {
      return false
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-center">{error}</p>
      </div>
    )
  }

  const productsWithoutUrl = products.filter((p) => !p.urlpage || p.urlpage === p.id)
  const activeProducts = products.filter((p) => p.active)
  const inactiveProducts = products.filter((p) => !p.active)

  function getProductUrl(product: Product) {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://mipartnerv0.vercel.app"

    // Asegurar que urlpage no tenga más de 90 caracteres para evitar problemas
    // Si urlpage no existe o es demasiado largo, usar el ID del producto
    const urlPath = product.urlpage && product.urlpage.length < 90 ? product.urlpage : product.id

    return `${baseUrl}/product/${urlPath}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Verificación de Páginas de Productos</h1>
        <Button variant="outline" onClick={loadProducts} className="flex items-center gap-2">
          <Loader2 className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Total de Productos</h3>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Productos Activos</h3>
          <p className="text-2xl font-bold text-green-600">{activeProducts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium text-gray-500">Productos Inactivos</h3>
          <p className="text-2xl font-bold text-red-600">{inactiveProducts.length}</p>
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 break-all">{getProductUrl(product)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(getProductUrl(product), "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas */}
      {productsWithoutUrl.length > 0 && (
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Productos sin URL personalizada</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {productsWithoutUrl.length} productos necesitan una URL personalizada. Esto puede afectar la
                  experiencia del usuario y el SEO.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

