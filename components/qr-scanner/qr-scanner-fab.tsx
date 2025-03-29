"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Scan } from "lucide-react"
import dynamic from "next/dynamic"

// Importar la librería de forma dinámica para evitar problemas de SSR
const Html5QrcodeScanner = dynamic(() => import("html5-qrcode").then((mod) => mod.Html5QrcodeScanner), { ssr: false })

export default function QrScannerFab() {
  const [showScanner, setShowScanner] = useState(false)
  const [scannerLoaded, setScannerLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let scanner: any = null

    const initializeScanner = async () => {
      if (showScanner && typeof window !== "undefined") {
        try {
          // Limpiar cualquier instancia previa
          const scannerContainer = document.getElementById("qr-reader")
          if (scannerContainer) {
            scannerContainer.innerHTML = ""
          }

          // Verificar si la API de cámara está disponible
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError("Tu navegador no soporta acceso a la cámara. Por favor, intenta con otro navegador.")
            return
          }

          // Crear el escáner con configuración mejorada
          scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              rememberLastUsedCamera: true,
              aspectRatio: 1.0,
              formatsToSupport: [0], // Solo formato QR Code (0)
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
            },
            false,
          )

          // Iniciar el escáner
          scanner.render(onScanSuccess, onScanFailure)
          setScannerLoaded(true)
          setError(null)

          // Bloquear el scroll cuando el escáner está activo
          document.body.style.overflow = "hidden"
        } catch (err) {
          console.error("Error al inicializar el escáner:", err)
          setError("Error al inicializar el escáner. Por favor, recarga la página e intenta nuevamente.")
        }
      }
    }

    initializeScanner()

    // Limpiar cuando el componente se desmonta o cuando se oculta el escáner
    return () => {
      if (scanner && scanner.clear) {
        try {
          scanner.clear()
        } catch (err) {
          console.error("Error al limpiar el escáner:", err)
        }
      }
      document.body.style.overflow = "auto"
      setScannerLoaded(false)
    }
  }, [showScanner])

  const onScanSuccess = (decodedText: string) => {
    // Cerrar el escáner
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

    // Si el error persiste por mucho tiempo, mostrar un mensaje más amigable
    if (errorMessage.includes("No MultiFormat Readers were able to detect the code")) {
      // No hacemos nada, es normal cuando no hay un QR en la vista
    } else if (errorMessage.includes("Camera access denied")) {
      setError("Acceso a la cámara denegado. Por favor, permite el acceso a la cámara e intenta nuevamente.")
    }
  }

  const handleOpenScanner = () => {
    setError(null)
    setShowScanner(true)
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
              onClick={() => setShowScanner(false)}
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

            <div id="qr-reader" className="mx-auto"></div>

            {!scannerLoaded && !error && (
              <div className="my-4 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
                <span className="ml-2">Cargando cámara...</span>
              </div>
            )}

            <div className="mt-4 text-center text-sm text-gray-500">
              Recuerde que solo puede agregar 1 unidad por referencia de producto
            </div>
          </div>
        </div>
      )}
    </>
  )
}

