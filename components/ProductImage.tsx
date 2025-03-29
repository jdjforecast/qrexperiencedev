"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

/**
 * Props para el componente ProductImage
 */
interface ProductImageProps {
  /** URL de la imagen */
  src: string | null
  /** Texto alternativo para la imagen */
  alt?: string
  /** Ancho de la imagen en píxeles */
  width?: number
  /** Alto de la imagen en píxeles */
  height?: number
  /** Si la imagen debería tener prioridad de carga */
  priority?: boolean
  /** Calidad de la imagen (1-100) */
  quality?: number
  /** Estilos adicionales */
  className?: string
  /** Modo de ajuste de la imagen */
  objectFit?: "cover" | "contain" | "fill"
}

/**
 * Componente para mostrar imágenes de productos con manejo de errores y carga optimizada
 * @param {ProductImageProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de imagen
 */
export function ProductImage({
  src,
  alt = "Imagen de producto",
  width = 500,
  height = 500,
  priority = false,
  quality = 80,
  className = "",
  objectFit = "cover",
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imgSrc, setImgSrc] = useState<string>("/placeholder.svg")

  // Procesar URL de imagen
  useEffect(() => {
    if (src) {
      setImgSrc(src)
      setError(false)
    } else {
      setImgSrc("/placeholder.svg")
    }
  }, [src])

  // Componente para mostrar cuando no hay imagen o hay error
  const FallbackImage = () => (
    <div
      className={`bg-gray-100 dark:bg-gray-800 rounded-md flex flex-col items-center justify-center ${className}`}
      style={{ width: "100%", height: height || 300, minHeight: "200px" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-12 h-12 text-gray-400 mb-2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <p className="text-gray-500 dark:text-gray-400 text-sm">Imagen no disponible</p>
    </div>
  )

  if (!src || error) {
    return <FallbackImage />
  }

  return (
    <div className={`relative ${className}`} style={{ width: "100%", height: "auto", minHeight: "200px" }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      <Image
        src={imgSrc}
        alt={alt}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        fill={!width || !height}
        width={!width ? undefined : width}
        height={!height ? undefined : height}
        style={{ objectFit, borderRadius: "0.375rem" }}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          console.error("Error al cargar imagen:", imgSrc)
          setError(true)
        }}
        loading={priority ? "eager" : "lazy"}
        quality={quality}
        className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  )
}

