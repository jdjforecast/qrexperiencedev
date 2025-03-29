"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, X } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase"
import { ProductImage } from "@/components/ProductImage"
import { formatCurrency } from "@/lib/utils"

// Tipos mejorados y documentados
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface Product {
  id: string
  name: string
  price: number
  image_url?: string
}

interface MobileCartProps {
  product: Product
}

/**
 * Componente de carrito móvil que permite gestionar productos en un carrito local
 * @param {MobileCartProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de carrito móvil
 */
export function MobileCart({ product }: MobileCartProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  // Cargar items del carrito desde localStorage al montar el componente
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem("mobile_cart")
      if (savedItems) {
        setItems(JSON.parse(savedItems))
      }
    } catch (error) {
      console.error("Error loading cart items:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los items del carrito",
        variant: "destructive",
      })
    }
  }, [toast])

  /**
   * Añade un producto al carrito o incrementa su cantidad si ya existe
   */
  const addToCart = () => {
    try {
      const existingItem = items.find((item) => item.id === product.id)

      if (existingItem) {
        const updatedItems = items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
        setItems(updatedItems)
        localStorage.setItem("mobile_cart", JSON.stringify(updatedItems))
      } else {
        const newItems = [...items, { ...product, quantity: 1 }]
        setItems(newItems)
        localStorage.setItem("mobile_cart", JSON.stringify(newItems))
      }

      toast({
        title: "Producto añadido",
        description: `${product.name} ha sido añadido al carrito`,
      })
    } catch (error) {
      console.error("Error adding item to cart:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el producto al carrito",
        variant: "destructive",
      })
    }
  }

  /**
   * Elimina un producto del carrito
   * @param {string} itemId - ID del producto a eliminar
   */
  const removeFromCart = (itemId: string) => {
    try {
      const updatedItems = items.filter((item) => item.id !== itemId)
      setItems(updatedItems)
      localStorage.setItem("mobile_cart", JSON.stringify(updatedItems))

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del carrito",
      })
    } catch (error) {
      console.error("Error removing item from cart:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto del carrito",
        variant: "destructive",
      })
    }
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   * @param {string} itemId - ID del producto
   * @param {number} newQuantity - Nueva cantidad
   */
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const updatedItems = items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
      setItems(updatedItems)
      localStorage.setItem("mobile_cart", JSON.stringify(updatedItems))
    } catch (error) {
      console.error("Error updating item quantity:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad del producto",
        variant: "destructive",
      })
    }
  }

  // Calcular el total de la compra
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="font-medium">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Cerrar carrito" : "Abrir carrito"}
          >
            {isOpen ? <X className="h-6 w-6" /> : "Ver carrito"}
          </Button>
        </div>

        {isOpen && (
          <div className="mt-4 pb-4">
            {items.length === 0 ? (
              <p className="text-center text-gray-500">El carrito está vacío</p>
            ) : (
              <>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                          <ProductImage
                            src={item.image_url || null}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="rounded"
                            objectFit="cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Reducir cantidad"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Eliminar producto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">{formatCurrency(total)}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Checkout",
                        description: "Funcionalidad de checkout en desarrollo",
                      })
                    }}
                  >
                    Proceder al pago
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

