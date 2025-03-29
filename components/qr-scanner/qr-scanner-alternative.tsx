"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Scan } from "lucide-react"
import dynamic from "next/dynamic"

// Importar la librería de forma dinámica para evitar problemas de SSR
const Html5QrcodeModule = dynamic(() => import("html5-qrcode").then((mod) => ({ Html5Qrcode: mod.Html5Qrcode })), {
  ssr: false,
})

export default function QrScannerAlternative() {
  const [showScanner, setShowScanner] = useState(false)
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Limpiar el escáner cuando el componente se desmonta
    return () => {
      if (scannerRef.current && scannerRef.current.stop) {
        try {
          scannerRef.current.stop()
        } catch (err) {
          console.error("Error al detener el escáner:", err)
        }
      }
    }
  }, [])

  useEffect(() => {
    const getCameras = async () => {
      if (showScanner && Html5QrcodeModule && Html5QrcodeModule.Html5Qrcode) {
        try {
          const devices = await Html5QrcodeModule.Html5Qrcode.getCameras()
          if (devices && devices.length) {
            setCameras(devices)
            setSelectedCamera(devices[0].id)
          } else {
            setError(
              "No se detectaron cámaras. Por favor, asegúrate de que tu dispositivo tiene una cámara y que has concedido los permisos necesarios.",
            )
          }
        } catch (err) {
          console.error("Error al obtener cámaras:", err)
          setError("Error al acceder a las cámaras. Por favor, asegúrate de que has concedido los permisos necesarios.")
        }
      }
    }

    if (showScanner) {
      getCameras()
    }
  }, [showScanner, Html5QrcodeModule])

  const startScanner = async () => {
    if (!selectedCamera || !Html5QrcodeModule || !Html5QrcodeModule.Html5Qrcode) return

    try {
      setScanning(true)
      setError(null)

      const html5QrCode = new Html5QrcodeModule.Html5Qrcode("qr-reader-alternative")
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanFailure,
      )
    } catch (err) {
      console.error("Error al iniciar el escáner:", err)
      setError("Error al iniciar el escáner. Por favor, intenta nuevamente.")
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        setScanning(false)
      } catch (err) {
        console.error("Error al detener el escáner:", err)
      }
    }
  }

  const onScanSuccess = (decodedText: string) => {
    // Detener el escáner
    stopScanner()
    setShowScanner(false)

    try {
      // Verificar si la URL es válida y pertenece a nuestro dominio
      const url = new URL(decodedText)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || window.location.origin

      if (url.origin === new URL(appUrl).origin) {
        // Si es una URL de nuestra aplicación, navegar a ella
        router.push(url.pathname + url.search)
      } else {
        // Si es una URL externa, verificar si es un código de producto válido
        if (decodedText.includes("/product/")) {
          const productId = decodedText.split("/product/")[1].split("?")[0]
          router.push(`/product/${productId}`)
        } else {
          alert("Código QR no válido. Por favor, escanee un código QR de producto válido.")
        }
      }
    } catch (error) {
      // Si no es una URL válida, verificar si es un ID de producto
      if (decodedText.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
        router.push(`/product/${decodedText}`)
      } else {
        alert("Código QR no reconocido. Por favor, intente nuevamente.")
      }
    }
  }

  const onScanFailure = (errorMessage: string) => {
    // Solo registrar el error, no mostrar al usuario para evitar spam
    console.error("Error al escanear:", errorMessage)
  }

  const handleOpenScanner = () => {
    setError(null)
    setShowScanner(true)
  }

  const handleCloseScanner = () => {
    stopScanner()
    setShowScanner(false)
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={handleOpenScanner}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Escanear código QR"
      >
        <Scan className="h-6 w-6" />
      </button>

      {/* Overlay del escáner */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6">
            <button
              onClick={handleCloseScanner}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              aria-label="Cerrar escáner"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="mb-4 text-center text-xl font-bold">Escanear Código QR</h3>

            {error ? (
              <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-red-700">
                <p>{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    setShowScanner(false)
                    setTimeout(() => setShowScanner(true), 100)
                  }}
                  className="mt-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <p className="mb-4 text-center text-sm text-gray-600">
                Apunte la cámara al código QR del producto para agregarlo a su carrito
              </p>
            )}

            {cameras.length > 0 && (
              <div className="mb-4">
                <label htmlFor="camera-select" className="mb-2 block text-sm font-medium text-gray-700">
                  Seleccionar cámara:
                </label>
                <select
                  id="camera-select"
                  value={selectedCamera || ""}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Cámara ${camera.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!scanning && selectedCamera && (
              <button
                onClick={startScanner}
                className="mb-4 w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
              >
                Iniciar escáner
              </button>
            )}

            {scanning && (
              <button
                onClick={stopScanner}
                className="mb-4 w-full rounded-md bg-red-600 py-2 text-white hover:bg-red-700"
              >
                Detener escáner
              </button>
            )}

            <div id="qr-reader-alternative" className="mx-auto overflow-hidden rounded-lg"></div>

            <div className="mt-4 text-center text-sm text-gray-500">
              Recuerde que solo puede agregar 1 unidad por referencia de producto
            </div>
          </div>
        </div>
      )}
    </>
  )
}

