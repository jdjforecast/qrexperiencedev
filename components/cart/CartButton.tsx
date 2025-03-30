"use client"

import { useState } from "react"
import Link from "next/link"
import { useCart } from "./CartProvider"
import { ShoppingCart } from "lucide-react"

export default function CartButton() {
  const { totalItems, totalPrice, items } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const toggleCart = () => setIsOpen(!isOpen)

  return (
    <div className="relative">
      <button
        onClick={toggleCart}
        className="flex items-center p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        aria-label="Carrito de compras"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 border">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Tu Carrito</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500 text-sm py-3">Tu carrito está vacío</p>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center py-2 border-b">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} x ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-sm font-medium">${(item.quantity * item.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href="/cart"
                      className="flex-1 bg-gray-100 py-2 px-4 rounded text-center text-sm hover:bg-gray-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Ver Carrito
                    </Link>
                    <Link
                      href="/checkout"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center text-sm hover:bg-blue-700"
                      onClick={() => setIsOpen(false)}
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

