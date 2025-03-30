"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart/CartProvider"
import { ShoppingCart, QrCode, ArrowLeft } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  stock?: number
}

export default function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const router = useRouter()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })

    // Mostrar mensaje de éxito
    alert(`${product.name} agregado al carrito`)
  }

  const handleContinueScanning = () => {
    router.push("/scan")
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/2">
          <div className="aspect-square bg-gray-100 relative">
            {product.image_url ? (
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:w-1/2">
          <Link href="/products" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a productos
          </Link>

          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

          <div className="text-xl font-bold text-blue-600 mb-4">${product.price.toFixed(2)}</div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Descripción</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium mb-1">
              Cantidad
            </label>
            <div className="flex items-center">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 border rounded-l-md bg-gray-100"
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="w-16 text-center border-t border-b py-1"
              />
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-3 py-1 border rounded-r-md bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Agregar al Carrito
            </button>

            <button
              onClick={handleContinueScanning}
              className="flex-1 bg-gray-100 py-3 px-4 rounded-md hover:bg-gray-200 flex items-center justify-center"
            >
              <QrCode className="h-5 w-5 mr-2" />
              Seguir Escaneando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

