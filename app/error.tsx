"use client"

import { useEffect } from "react"
import Link from "next/link"

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error en aplicación:", error)
  }, [error])

  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Algo salió mal</h1>
      <p className="mb-6">Lo sentimos, ha ocurrido un error al cargar la página.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => reset()}>
          Intentar nuevamente
        </button>
        <Link href="/" className="bg-gray-200 px-4 py-2 rounded inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

