"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  objectFit = "cover",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {isLoading && <div className="absolute inset-0 bg-slate-200/20 animate-pulse rounded-md"></div>}

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "duration-700 ease-in-out",
          isLoading ? "scale-110 blur-sm opacity-70" : "scale-100 blur-0 opacity-100",
          className,
        )}
        style={{ objectFit }}
        quality={quality}
        priority={priority}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  )
}

