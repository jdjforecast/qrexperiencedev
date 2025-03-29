"use client"

import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  onAddToCart?: () => void
}

export function ProductCard({ id, name, description, price, imageUrl, onAddToCart }: ProductCardProps) {
  return (
    <div className="card">
      <div className="relative h-48 mb-4">
        <Image
          src={imageUrl || "/placeholder.svg?height=200&width=200"}
          alt={name}
          fill
          style={{ objectFit: "cover" }}
          className="rounded-t-lg"
        />
      </div>
      <h3 className="text-xl font-bold text-blanco">{name}</h3>
      <p className="text-sm text-blanco mb-2">{description}</p>
      <p className="text-lg font-bold text-verde mb-4">${price.toFixed(2)}</p>
      <div className="flex justify-between">
        <Link href={`/product/${id}`} className="button bg-azul-medio">
          Ver detalles
        </Link>
        {onAddToCart && (
          <button onClick={onAddToCart} className="button">
            Añadir al carrito
          </button>
        )}
      </div>
    </div>
  )
}

