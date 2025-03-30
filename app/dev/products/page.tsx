import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase'

// Interface matching the data we fetch - fetch id, name, and urlpage
interface ProductInfo {
  id: string // Database UUID
  name: string
  urlpage: string | null // The specific URL path segment
}

export default function DevProductListPage() {
  const [products, setProducts] = useState<ProductInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getBrowserClient()

  useEffect(() => {
    async function loadProductList() {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error: dbError } = await supabase
          .from('products')
          // Select id, name, and urlpage
          .select('id, name, urlpage')
          .order('name', { ascending: true })

        if (dbError) {
          throw dbError;
        }

        setProducts(data || []);

      } catch (err: any) {
        console.error("Error loading product list for dev page:", err)
        setError(err.message || "An unexpected error occurred fetching product list")
      } finally {
        setIsLoading(false)
      }
    }

    loadProductList()
  }, [supabase])

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-white">
      <h1 className="mb-6 text-2xl sm:text-3xl font-bold text-center">Lista de Productos (Desarrollo)</h1>
      <p className="mb-6 text-center text-yellow-300 bg-yellow-900/50 p-2 rounded-md">
        <strong>Nota:</strong> Estos enlaces usan el valor de la columna 'urlpage'.
        Si un producto no tiene 'urlpage', no se generará enlace funcional para él.
      </p>

      {isLoading ? (
        <div className="flex justify-center pt-10">
          <p>Cargando lista...</p>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-100 border border-red-400 text-red-700 p-4 text-sm">
          Error al cargar la lista: {error}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-md bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 text-sm">
          No se encontraron productos en la base de datos.
        </div>
      ) : (
        <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <ul className="space-y-2">
            {products.map((product) => {
              // Use urlpage for the link. Only create link if urlpage exists.
              const linkHref = product.urlpage ? `/products/${product.urlpage}` : null;
              
              return (
                <li key={product.id} className="border-b border-white/10 pb-2 last:border-b-0 flex justify-between items-center">
                  <span>
                    {linkHref ? (
                      <Link
                        href={linkHref}
                        className="text-blue-300 hover:text-blue-100 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 py-0.5 transition-colors duration-150"
                        title={`Ir a ${linkHref}`}
                      >
                        {product.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">{product.name}</span>
                    )}
                  </span>
                  {/* Display the urlpage value or indicate if missing */}
                  <span className="text-xs font-mono text-gray-400 bg-gray-700/50 px-1.5 py-0.5 rounded">
                    urlpage: {product.urlpage || <span className="text-red-400 italic">NULO</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  )
} 