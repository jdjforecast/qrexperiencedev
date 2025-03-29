"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import Image from "next/image"
import type { Product } from "@/types/product"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils"

/**
 * Props para el componente ProductCard
 */
interface ProductCardProps {
  /** Información del producto a mostrar */
  product: Product
  /** Función para manejar el clic en el botón de info */
  onAddToCart: (product: Product) => void
  /** Indica si se debe mostrar animación */
  animate?: boolean
}

/**
 * Tarjeta de producto con efectos visuales y animaciones
 * @param {ProductCardProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de tarjeta de producto
 */
export default function ProductCard({ product, onAddToCart, animate = true }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Componente base con o sin animación
  const CardComponent = animate ? motion.div : "div"

  // Propiedades de animación
  const animationProps = animate
    ? {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        whileHover: { y: -5, transition: { duration: 0.2 } },
        transition: { duration: 0.3 },
      }
    : {}

  // Imagen fallback si no hay URL de imagen
  const imageUrl = product.image_url || "/placeholder.svg"

  return (
    <CardComponent
      {...animationProps}
      className="relative focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none rounded-xl"
      tabIndex={0}
    >
      {/* Product platform */}
      <div className="w-full h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mb-1" aria-hidden="true" />

      {/* Product card with glass effect */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 flex flex-col items-center">
        <div className="w-20 h-20 relative mb-2">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={product.name}
            width={80}
            height={80}
            className={`drop-shadow-lg mix-blend-multiply transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            style={{ objectFit: "contain" }}
            quality={85}
          />
        </div>

        <h3 className="font-medium text-sm text-center line-clamp-1" title={product.name}>
          {product.name}
        </h3>
        <p className="text-blue-100 text-sm">{formatCurrency(product.price)}</p>

        <Button
          size="sm"
          className="mt-2 bg-blue-600 hover:bg-blue-700 rounded-full w-full"
          onClick={() => onAddToCart(product)}
          aria-label={`Ver información de ${product.name}`}
        >
          <Info className="h-4 w-4 mr-1" /> Info
        </Button>
      </div>

      {/* Decorative bubble */}
      <div
        className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-radial from-blue-400 to-blue-600 bg-opacity-70 backdrop-blur-sm border border-blue-300/50"
        aria-hidden="true"
      />
    </CardComponent>
  )
}

