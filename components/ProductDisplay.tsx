"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MinusCircle, PlusCircle, ShoppingCart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  description?: string
  price?: number
  image_url?: string
  category?: string
}

interface ProductDisplayProps {
  product: Product
  onAddToCart?: (productId: string, quantity: number) => void
  compact?: boolean
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product, onAddToCart, compact = false }) => {
  const [quantity, setQuantity] = useState(1)

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 99))
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id, quantity)
    }
  }

  // Producto compacto (solo imagen, nombre y precio)
  if (compact) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              {product.image_url && (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{product.name}</h3>
                <p className="text-sm font-bold text-primary">
                  {product.price ? formatCurrency(product.price) : "$0.00"}
                </p>
              </div>
              {onAddToCart && (
                <Button size="sm" onClick={() => onAddToCart(product.id, 1)}>
                  <ShoppingCart size={16} />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Visualización detallada
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Imagen del producto */}
        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-muted">
              <span className="text-muted-foreground">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>

          {product.category && (
            <Badge variant="outline" className="mb-2">
              {product.category}
            </Badge>
          )}

          <p className="text-3xl font-bold text-primary">{product.price ? formatCurrency(product.price) : "$0.00"}</p>

          <p className="text-muted-foreground">
            {product.description || "No hay descripción disponible para este producto."}
          </p>

          {onAddToCart && (
            <div className="pt-4">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium">Cantidad:</span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                    <MinusCircle size={18} />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={incrementQuantity} disabled={quantity >= 99}>
                    <PlusCircle size={18} />
                  </Button>
                </div>
              </div>

              <Button onClick={handleAddToCart} className="w-full" size="lg">
                <ShoppingCart className="mr-2" size={18} />
                Añadir al carrito
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDisplay

