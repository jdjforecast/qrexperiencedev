"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ManualCodeEntry() {
  const [productCode, setProductCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!productCode.trim()) {
      setError("Por favor, ingresa un código de producto")
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Verificar si es un UUID válido
    if (productCode.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      router.push(`/product/${productCode}`)
    } else {
      setError("Código de producto no válido. Por favor, ingresa un código válido.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-sm font-medium text-gray-700">
        ¿Problemas con el escáner? Ingresa el código manualmente:
      </h4>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <input
          type="text"
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          placeholder="Ingresa el código del producto"
          className="rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isSubmitting ? "Procesando..." : "Buscar producto"}
        </button>
      </form>
    </div>
  )
}

