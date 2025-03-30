"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart/CartProvider"
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Tu Carrito</h1>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">Parece que aún no has agregado ningún producto a tu carrito.</p>
          <Link href="/scan" className="inline-block bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700">
            Escanear Productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Tu Carrito</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="grid grid-cols-12 gap-4 font-medium text-gray-600">
            <div className="col-span-6">Producto</div>
            <div className="col-span-2 text-center">Precio</div>
            <div className="col-span-2 text-center">Cantidad</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
        </div>

        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="p-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6 flex items-center">
                <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 mr-4">
                  {item.image_url ? (
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 text-sm flex items-center mt-1 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="col-span-2 text-center">${item.price.toFixed(2)}</div>

              <div className="col-span-2 flex justify-center">
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 border rounded-l-md bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="w-12 text-center border-t border-b py-1"
                  />
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 border rounded-r-md bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="col-span-2 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <button onClick={clearCart} className="text-red-500 hover:text-red-700">
              Vaciar carrito
            </button>

            <div className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</div>
          </div>

          <div className="flex justify-between">
            <Link href="/scan" className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Seguir escaneando
            </Link>

            <Link href="/checkout" className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700">
              Proceder al Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

