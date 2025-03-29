"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"

interface QRScannerProps {
  onScan: (data: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isBrowserSupported, setIsBrowserSupported] = useState(true)
  const scannerId = useRef(`qr-scanner-container-${Math.random().toString(36).substring(2, 15)}`)

  useEffect(() => {
    if (!containerRef.current) return

    // Asignar el ID único al contenedor
    containerRef.current.id = scannerId.current

    // Verificar si el navegador es compatible
    const checkBrowserSupport = async () => {
      try {
        // Verificar si mediaDevices está disponible
        if (!navigator || !navigator.mediaDevices) {
          setError("Tu navegador no soporta el acceso a la cámara")
          setIsBrowserSupported(false)
          return false
        }

        // Solicitar permisos y verificar cámaras disponibles
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          // Liberar la cámara después de la prueba
          stream.getTracks().forEach((track) => track.stop())
          return true
        } catch (err) {
          console.error("Error accessing camera:", err)
          setError("No se pudo acceder a la cámara. Verifica los permisos.")
          setIsBrowserSupported(false)
          return false
        }
      } catch (err) {
        console.error("Error checking browser support:", err)
        setError("Tu navegador no es compatible con el escáner QR")
        setIsBrowserSupported(false)
        return false
      }
    }

    // Inicializar el escáner solo si el navegador es compatible
    const initScanner = async () => {
      const isSupported = await checkBrowserSupport()

      if (!isSupported) return

      try {
        // Configuración del escáner
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
          disableFlip: false,
        }

        // Inicializar el escáner
        if (Html5Qrcode && containerRef.current && containerRef.current.id) {
          scannerRef.current = new Html5Qrcode(containerRef.current.id)

          // Iniciar el escaneo con manejo de errores mejorado
          await scannerRef.current.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              // Si se decodifica un QR, llamar a la función onScan
              onScan(decodedText)
            },
            (errorMessage) => {
              // Ignorar errores de escaneo continuos
              if (errorMessage.includes("No QR code found")) {
                return
              }
              console.warn("QR scan error:", errorMessage)
            },
          )
        } else {
          throw new Error("Error initializing QR scanner")
        }
      } catch (err) {
        console.error("Error starting QR scanner:", err)
        setError("Error al iniciar el escáner: Cámara no disponible o permiso denegado")
        setIsBrowserSupported(false)
      }
    }

    // Iniciar el escáner con un pequeño retraso para asegurar que el DOM esté listo
    const timeoutId = setTimeout(() => {
      initScanner()
    }, 500)

    // Limpiar el escáner cuando el componente se desmonte
    return () => {
      clearTimeout(timeoutId)
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            console.log("QR Scanner stopped")
          })
          .catch((err) => {
            console.error("Error stopping QR scanner:", err)
          })
      }
    }
  }, [onScan])

  if (!isBrowserSupported) {
    return (
      <div className="qr-scanner flex items-center justify-center">
        <div className="text-center p-4 bg-red-500/20 rounded-lg">
          <p className="text-white">{error || "La cámara no está disponible en este dispositivo o navegador"}</p>
          <p className="text-sm mt-2 text-blue-100">Intenta en otro dispositivo o navegador</p>
        </div>
      </div>
    )
  }

  return (
    <div className="qr-scanner">
      <div ref={containerRef} className="w-full h-full" />
      <style jsx>{`
        .qr-scanner {
          width: 100%;
          height: 100%;
          min-height: 300px;
        }
        #${scannerId.current} {
          width: 100%;
          height: 100%;
          min-height: 300px;
        }
      `}</style>
    </div>
  )
}

