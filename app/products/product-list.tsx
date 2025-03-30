"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getBrowserClient } from "@/lib/supabase-client-browser"
import { getCurrentUser } from "@/lib/auth-utils"
import type { User } from "@supabase/supabase-js"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
}

export default function ProductList({ products }: { products: Product[] }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userProducts, setUserProducts] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUserData() {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        if (user) {
          // Check which products the user already has
          const productStatus: Record<string, boolean> = {}

          for (const product of products) {
            try {
              const hasProduct = await getBrowserClient.hasUserProduct(user.id, product.id)
              productStatus[product.id] = hasProduct
            } catch (err) {
              console.error(`Error checking product ${product.id}:`, err)
              productStatus[product.id] = false
            }
          }

          setUserProducts(productStatus)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [products])

  if (products.length === 0) {
    return <p>No products available at this time.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="aspect-video bg-gray-100 relative">
            {product.image_url ? (
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>

              {isLoading ? (
                <button disabled className="px-4 py-2 bg-gray-300 text-gray-700 rounded">
                  Loading...
                </button>
              ) : userProducts[product.id] ? (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded">Already purchased</span>
              ) : (
                <Link
                  href={
                    currentUser
                      ? `/products/${product.id}`
                      : "/login?redirect=" + encodeURIComponent(`/products/${product.id}`)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Details
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

