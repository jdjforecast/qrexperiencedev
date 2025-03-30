"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import RouteGuard from "@/components/auth/route-guard"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { getBrowserClient } from "@/lib/supabase-client-browser"

// Reuse the Product interface (ensure it includes short_code)
interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  short_code: string // Essential for linking
  // Add other fields if displayed on the card
}

export default function AllProductsCatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getBrowserClient() // Get the singleton client instance

  useEffect(() => {
    async function loadAllProducts() {
      setIsLoading(true)
      setError(null)
      try {
        // *** FETCH DIRECTLY USING SUPABASE CLIENT ***
        const { data, error: dbError } = await supabase
          .from("products")
          .select("id, name, description, price, image_url, stock, short_code") // Select needed fields
          .order("name", { ascending: true }) // Optional: order products

        if (dbError) {
          // Throw the database error to be caught below
          throw dbError
        }

        // Ensure the data includes short_code (should be guaranteed by select)
        if (data && data.length > 0 && typeof data[0].short_code === "undefined") {
          console.warn("Supabase query result might be missing 'short_code'. Check select statement.")
        }

        // Filter out products without short_code just in case
        setProducts(data?.filter((p) => p.short_code) || [])
      } catch (err: any) {
        // Catch SupabaseError or other errors
        console.error("Error loading all products directly from Supabase:", err)
        setError(err.message || "An unexpected error occurred fetching products")
      } finally {
        setIsLoading(false)
      }
    }

    loadAllProducts()
    // Add supabase client as dependency if required by linting rules, although it's stable
  }, [supabase])

  return (
    // This catalog might be public or require auth depending on your needs
    <RouteGuard requireAuth>
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-3xl font-bold text-white text-center">Catálogo Completo</h1>

        {isLoading ? (
          <div className="flex justify-center pt-10">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-100 border border-red-400 text-red-700 p-4 text-sm">
            Error al cargar productos: {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-md bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 text-sm">
            No hay productos disponibles en este momento.
          </div>
        ) : (
          // ... (rest of the rendering logic with grid and Link using product.short_code remains the same)
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.short_code}`}
                className="group block overflow-hidden rounded-lg bg-white shadow-md transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[--verde] focus:ring-offset-2"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <span className="text-gray-500">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="p-4 text-gray-900">
                  <h2 className="mb-1 truncate text-base font-semibold" title={product.name}>
                    {product.name}
                  </h2>
                  <p className="mb-2 text-lg font-bold text-gray-800">${product.price.toFixed(2)}</p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                      product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock > 0 ? "En stock" : "Agotado"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  )
}

