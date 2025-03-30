"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { AlertCircle, Camera } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
  config?: {
    fps?: number
    qrbox?: { width: number, height: number } | number
    aspectRatio?: number
    disableFlip?: boolean
  }
}

export function QRScanner({ onScan, onError, config = {} }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isBrowserSupported, setIsBrowserSupported] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const scannerId = useRef(`qr-scanner-${Math.random().toString(36).substring(2, 9)}`)

  // Función para verificar la compatibilidad del navegador y cámara
  const checkBrowserSupport = async () => {
    try {
      if (!navigator || !navigator.mediaDevices) {
        throw new Error("Tu navegador no soporta el acceso a la cámara")
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach((track) => track.stop())
        return true
      } catch (err) {
        const errorMsg = "No se pudo acceder a la cámara. Verifica los permisos."
        if (onError) onError(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al verificar compatibilidad"
      setError(errorMsg)
      setIsBrowserSupported(false)
      if (onError) onError(errorMsg)
      return false
    }
  }

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.id = scannerId.current

    const initScanner = async () => {
      const isSupported = await checkBrowserSupport()
      if (!isSupported) return

      try {
        // Configuración del escáner con valores por defecto y personalizables
        const scannerConfig = {
          fps: config.fps || 10,
          qrbox: config.qrbox || { width: 250, height: 250 },
          aspectRatio: config.aspectRatio || 1,
          disableFlip: config.disableFlip || false,
        }

        if (Html5Qrcode && containerRef.current && containerRef.current.id) {
          scannerRef.current = new Html5Qrcode(containerRef.current.id)

          await scannerRef.current.start(
            { facingMode: "environment" },
            scannerConfig,
            (decodedText) => {
              setIsScanning(true)
              // Proporcionar feedback visual antes de enviar el resultado
              setTimeout(() => {
                onScan(decodedText)
                setIsScanning(false)
              }, 300)
            },
            (errorMessage) => {
              // Ignorar errores normales de escaneo
              if (errorMessage.includes("No QR code found")) return
              if (onError) onError(errorMessage)
            },
          )
        } else {
          throw new Error("Error initializing QR scanner")
        }
      } catch (err) {
        const errorMsg = "Error al iniciar el escáner: Cámara no disponible o permiso denegado"
        setError(errorMsg)
        setIsBrowserSupported(false)
        if (onError) onError(errorMsg)
      }
    }

    // Pequeño retraso para inicializar el escáner
    const timeoutId = setTimeout(initScanner, 500)

    // Limpieza al desmontar
    return () => {
      clearTimeout(timeoutId)
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .catch(e => console.error("Error stopping QR scanner:", e))
      }
    }
  }, [onScan, onError, config])

  if (!isBrowserSupported) {
    return (
      <div className="qr-scanner flex items-center justify-center p-8">
        <div className="text-center card-solid">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-error" />
          <p className="text-white font-medium mb-2">Error en la cámara</p>
          <p className="text-white/80 text-sm">{error || "La cámara no está disponible en este dispositivo o navegador"}</p>
          <p className="text-sm mt-4 text-white/70">Intenta en otro dispositivo o navegador, o verifica los permisos de cámara.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="qr-scanner relative rounded-lg overflow-hidden">
      <div 
        ref={containerRef} 
        className={`w-full h-full min-h-[300px] bg-black/20 ${isScanning ? 'animate-pulse-light' : ''}`} 
      />
      
      {/* Overlay con marco de escaneo */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-[70%] h-[70%] border-2 border-white/70 rounded-lg">
          {/* Esquinas para resaltar */}
          <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-white"></div>
          <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-white"></div>
          
          {/* Línea de escaneo animada */}
          <div className="absolute left-0 w-full h-0.5 bg-white/70 animate-[scan_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
      
      {/* Guía para el usuario */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/40 text-white text-center text-sm">
        <Camera className="h-4 w-4 inline-block mr-1" />
        Coloca el código QR dentro del marco
      </div>
      
      <style jsx>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      
        #${scannerId.current} video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0.5rem;
        }
        
        .qr-scanner {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  )
}

