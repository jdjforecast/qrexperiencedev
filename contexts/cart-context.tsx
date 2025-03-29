"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

/**
 * Representa un item en el carrito de compras
 */
interface CartItem {
  /** ID único del producto */
  id: string
  /** Nombre del producto */
  name: string
  /** Precio del producto */
  price: number
  /** Cantidad seleccionada */
  quantity: number
  /** URL de la imagen del producto (opcional) */
  image_url?: string | null
}

/**
 * Tipo para el contexto del carrito
 */
interface CartContextType {
  /** Items en el carrito */
  items: CartItem[]
  /** Total de items en el carrito */
  itemCount: number
  /** Precio total del carrito */
  totalPrice: number
  /** Añadir un producto al carrito */
  addToCart: (item: CartItem) => void
  /** Eliminar un producto del carrito */
  removeFromCart: (id: string) => void
  /** Actualizar la cantidad de un producto */
  updateQuantity: (id: string, quantity: number) => void
  /** Vaciar el carrito */
  clearCart: () => void
  /** Indica si se está cargando el carrito */
  isLoading: boolean
}

// Clave para almacenar el carrito en localStorage
const CART_STORAGE_KEY = "app_shopping_cart"

/**
 * Contexto para el carrito de compras
 */
const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * Proveedor del contexto del carrito
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar items del carrito desde localStorage al iniciar
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY)
      if (savedItems) {
        setItems(JSON.parse(savedItems))
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el carrito guardado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Escuchar cambios en localStorage de otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        try {
          const updatedCart = e.newValue ? JSON.parse(e.newValue) : []
          setItems(updatedCart)
        } catch (error) {
          console.error("Error syncing cart from another tab:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Guardar items en localStorage cuando cambian
  useEffect(() => {
    // Solo guardar si no estamos en el proceso de carga inicial
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [items, isLoading])

  // Calcular propiedades derivadas
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  /**
   * Añade un producto al carrito o incrementa su cantidad si ya existe
   */
  const addToCart = useCallback((item: CartItem) => {
    setItems((currentItems) => {
      try {
        const existingItem = currentItems.find((i) => i.id === item.id)
        if (existingItem) {
          return currentItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i))
        }
        // Asegurar que la cantidad sea al menos 1
        const newItem = { ...item, quantity: item.quantity || 1 }
        return [...currentItems, newItem]
      } catch (error) {
        console.error("Error adding item to cart:", error)
        toast({
          title: "Error",
          description: "No se pudo añadir el producto al carrito",
          variant: "destructive",
        })
        return currentItems
      }
    })
  }, [])

  /**
   * Elimina un producto del carrito
   */
  const removeFromCart = useCallback((id: string) => {
    setItems((currentItems) => {
      try {
        return currentItems.filter((item) => item.id !== id)
      } catch (error) {
        console.error("Error removing item from cart:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto del carrito",
          variant: "destructive",
        })
        return currentItems
      }
    })
  }, [])

  /**
   * Actualiza la cantidad de un producto en el carrito
   */
  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return

    setItems((currentItems) => {
      try {
        return currentItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      } catch (error) {
        console.error("Error updating item quantity:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar la cantidad del producto",
          variant: "destructive",
        })
        return currentItems
      }
    })
  }, [])

  /**
   * Vacía el carrito de compras
   */
  const clearCart = useCallback(() => {
    try {
      setItems([])
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Error",
        description: "No se pudo vaciar el carrito",
        variant: "destructive",
      })
    }
  }, [])

  const contextValue: CartContextType = {
    items,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading,
  }

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

/**
 * Hook para acceder al contexto del carrito
 * @returns {CartContextType} Contexto del carrito
 * @throws {Error} Si se usa fuera de un CartProvider
 */
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

