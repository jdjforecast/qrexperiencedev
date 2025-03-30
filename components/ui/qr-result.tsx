"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, ShoppingCart, Tag, Check } from "lucide-react"
import type { Product } from "@/lib/products"

interface QRResultProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => Promise<void>
  onScanAgain: () => void
}

export function QRResult({ product, onAddToCart, onScanAgain }: QRResultProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleAddToCart = async () => {
    if (isAdding) return
    
    setIsAdding(true)
    try {
      await onAddToCart(product, quantity)
      setIsSuccess(true)
      
      // Reset después de mostrar el mensaje de éxito
      setTimeout(() => {
        setIsSuccess(false)
      }, 2000)
    } finally {
      setIsAdding(false)
    }
  }

  const adjustQuantity = (amount: number) => {
    const newQty = quantity + amount
    if (newQty >= 1 && newQty <= (product.max_per_user || 10)) {
      setQuantity(newQty)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="card fade-in">
      <div className="relative">
        {isSuccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg z-10 animate-fade-in">
            <div className="bg-success/20 backdrop-blur-md p-4 rounded-full">
              <Check className="h-10 w-10 text-success" />
            </div>
          </div>
        )}
        
        <div className="text-center mb-3">
          <h3 className="text-xl font-bold text-white">Producto Escaneado</h3>
          <div className="h-0.5 w-20 bg-white/20 mx-auto mt-2"></div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-4">
            {product.image_url ? (
              <div className="w-20 h-20 mr-4 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = "/images/placeholder.png" }}
                />
              </div>
            ) : (
              <div className="w-20 h-20 mr-4 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                <Tag className="h-8 w-8 text-white/50" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-lg">{product.name}</h4>
              <div className="flex items-center">
                <span className="text-xl font-bold text-white">
                  {formatPrice(product.price)}
                </span>
                {product.stock <= 5 && (
                  <span className="ml-2 text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                    {product.stock} disponibles
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {product.description && (
            <p className="text-white/80 text-sm mb-4 border-l-2 border-white/20 pl-3">{product.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => adjustQuantity(-1)}
                disabled={quantity <= 1 || isAdding}
                className="h-8 w-8 p-0 text-white"
              >
                -
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => adjustQuantity(1)}
                disabled={
                  (product.max_per_user && quantity >= product.max_per_user) || 
                  isAdding
                }
                className="h-8 w-8 p-0 text-white"
              >
                +
              </Button>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/70">Total:</div>
              <div className="font-bold text-white">
                {formatPrice(product.price * quantity)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={onScanAgain}
            variant="outline" 
            className="flex-1 border-white/30 hover:bg-white/10"
            disabled={isAdding}
          >
            Escanear otro
          </Button>
          <Button 
            onClick={handleAddToCart} 
            className="flex-1 bg-primary-light hover:bg-primary-dark"
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Agregando...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

