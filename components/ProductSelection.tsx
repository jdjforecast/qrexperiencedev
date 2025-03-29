"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "./ProductCard"
import type { Product } from "@/types/product"
import { useMemo } from "react"

/**
 * Props para el componente StepIndicator
 */
interface StepIndicatorProps {
  /** Número del paso actual */
  currentStep: number
  /** Total de pasos */
  steps: Array<{
    number: number
    label: string
  }>
}

/**
 * Componente para mostrar los pasos del proceso
 */
function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 p-4">
      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full ${
                step.number === currentStep
                  ? "bg-blue-500"
                  : step.number < currentStep
                    ? "bg-green-500"
                    : "bg-blue-400/50"
              } flex items-center justify-center mb-1`}
              aria-current={step.number === currentStep ? "step" : undefined}
            >
              <span className="font-bold">{step.number}</span>
            </div>
            <span className="text-xs text-center whitespace-pre-line">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Props para el componente ProductSelection
 */
interface ProductSelectionProps {
  /** Lista de productos disponibles */
  products: Product[]
  /** Función para añadir un producto al carrito */
  onAddToCart: (product: Product) => void
  /** Función para cerrar el selector de productos */
  onClose: () => void
  /** Categoría de productos (opcional) */
  category?: string
}

/**
 * Componente para seleccionar productos
 * @param {ProductSelectionProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de selección de productos
 */
export function ProductSelection({ products, onAddToCart, onClose, category = "PHARMA" }: ProductSelectionProps) {
  // Pasos del proceso
  const steps = useMemo(
    () => [
      { number: 1, label: "ESCANEA\nEL QR" },
      { number: 2, label: "REGÍSTRATE" },
      { number: 3, label: "ESCOGE\nPRODUCTOS" },
      { number: 4, label: "RECLAMA\nTU KIT" },
    ],
    [],
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-gradient-to-b from-blue-700/90 to-blue-600/90 backdrop-blur-md p-4 overflow-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Selección de productos"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">ELIGE TU KIT</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar selección de productos">
          <X className="h-6 w-6" />
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-center text-lg mb-4">No hay productos disponibles en este momento.</p>
          <Button onClick={onClose}>Volver</Button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">{category}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-8" onClick={onClose}>
              Continuar
            </Button>
          </div>
        </>
      )}

      {/* Indicador de pasos */}
      <StepIndicator currentStep={3} steps={steps} />
    </motion.div>
  )
}

