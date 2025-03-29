"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Info } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image_url: string
    category?: string
    description?: string
  }
  onClick?: (product: any) => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative cursor-pointer"
      onClick={() => onClick && onClick(product)}
    >
      {/* Product platform */}
      <div className="w-full h-4 bg-gradient-to-r from-[#0033A0] to-[#009CDE] rounded-full mb-1" />

      {/* Product card with glass effect */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 flex flex-col items-center">
        <div className="w-20 h-20 relative mb-2">
          <Image
            src={product.image_url || "/placeholder.svg?height=100&width=80"}
            alt={product.name}
            fill
            className="object-contain drop-shadow-lg"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>

        <h3 className="font-medium text-sm text-center">{product.name}</h3>
        <p className="text-blue-100 text-sm">{product.price} monedas</p>

        {product.description && (
          <div className="mt-2 text-xs text-white/80 line-clamp-2 text-center">{product.description}</div>
        )}

        <div className="mt-2 text-xs text-white/60 flex items-center">
          <Info className="h-3 w-3 mr-1" />
          <span>Toca para detalles</span>
        </div>
      </div>

      {/* Decorative bubble */}
      <motion.div
        className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-blue-400 bg-opacity-70 backdrop-blur-sm border border-blue-300/50"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
    </motion.div>
  )
}

