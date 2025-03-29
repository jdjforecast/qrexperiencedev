"use client"

import { useRef, useEffect, useState } from "react"

/**
 * Propiedades para personalizar el fondo de burbujas
 * @interface BubbleBackgroundProps
 */
interface BubbleBackgroundProps {
  /** Número de círculos a dibujar */
  numberOfCircles?: number
  /** Color base para los círculos (formato RGB) */
  baseColor?: string
  /** Opacidad máxima para los círculos (0-1) */
  maxOpacity?: number
}

/**
 * Componente que crea un fondo animado con burbujas/círculos
 * Utiliza canvas para un mejor rendimiento
 * @param {BubbleBackgroundProps} props - Propiedades del componente
 * @returns {JSX.Element} Elemento canvas con el fondo animado
 */
export function BubbleBackground({
  numberOfCircles = 15,
  baseColor = "0, 85, 184",
  maxOpacity = 0.4,
}: BubbleBackgroundProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  })

  // Efecto para gestionar el canvas y dibujar los círculos
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("BubbleBackground: No se pudo obtener el contexto 2D del canvas")
      return
    }

    // Configuración inicial del canvas
    const resizeCanvas = () => {
      const { devicePixelRatio: ratio = 1 } = window

      // Establecer el tamaño del canvas considerando la densidad de píxeles
      canvas.width = window.innerWidth * ratio
      canvas.height = window.innerHeight * ratio

      // Ajustar el contexto para la densidad de píxeles
      ctx.scale(ratio, ratio)

      // Actualizar las dimensiones en el estado
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })

      // Redibujar los círculos
      drawStaticGradientCircles()
    }

    /**
     * Dibuja círculos con gradientes en posiciones aleatorias
     */
    const drawStaticGradientCircles = () => {
      // Limpiar el canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Configuración para un mejor rendimiento
      ctx.save()

      // Crear varios círculos de diferentes tamaños en posiciones aleatorias
      for (let i = 0; i < numberOfCircles; i++) {
        try {
          // Tamaño aleatorio entre 50 y 350px
          const size = Math.random() * 300 + 50

          // Posiciones aleatorias en el canvas
          const x = Math.random() * dimensions.width
          const y = Math.random() * dimensions.height

          // Crear un gradiente radial
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)

          // Colores para el gradiente usando los parámetros
          gradient.addColorStop(0, `rgba(${baseColor}, ${maxOpacity})`)
          gradient.addColorStop(0.5, `rgba(${baseColor}, ${maxOpacity / 2})`)
          gradient.addColorStop(1, `rgba(${baseColor}, 0)`)

          // Dibujar el círculo
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        } catch (error) {
          console.error("Error al dibujar círculo:", error)
        }
      }

      ctx.restore()
    }

    // Configurar el canvas inicialmente
    resizeCanvas()

    // Optimizar resize con debounce para mejor rendimiento
    let resizeTimeout: NodeJS.Timeout | null = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)

      resizeTimeout = setTimeout(() => {
        resizeCanvas()
      }, 100) // Debounce de 100ms
    }

    // Agregar listener para redimensionar
    window.addEventListener("resize", handleResize)

    // Limpiar los event listeners y timeouts al desmontar
    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimeout) clearTimeout(resizeTimeout)
    }
  }, [numberOfCircles, baseColor, maxOpacity, dimensions.width, dimensions.height])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-full h-full"
      style={{
        pointerEvents: "none",
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
      aria-hidden="true"
    />
  )
}

