"use client"

import { motion } from "framer-motion"
import { QRScanner } from "@/components/ui/qr-scanner"
import { Loader2, AlertCircle } from "lucide-react"
import { useState } from "react"

type QRScannerViewProps = {
  isScanning: boolean
  isProcessing: boolean
  onScan: (code: string) => void
}

export function QRScannerView({ isScanning, isProcessing, onScan }: QRScannerViewProps) {
  const [scannerError, setScannerError] = useState<string | null>(null)

  // Manejar los escaneos pero con validación
  const handleScan = (code: string) => {
    if (!code || typeof code !== "string") {
      setScannerError("Código QR inválido o no reconocido")
      return
    }

    // Validar si el código está en un formato esperado
    if (code.length < 3) {
      setScannerError("Código QR demasiado corto o inválido")
      return
    }

    // Si todo está bien, pasar el código al manejador
    onScan(code)
  }

  if (!isScanning) return null

  return (
    <motion.div
      key="qr-scanner-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      <div className="aspect-square rounded-xl overflow-hidden relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Procesando...</p>
            </div>
          </div>
        )}

        <div className={`w-full h-full ${isProcessing ? "opacity-50" : ""}`}>
          {scannerError ? (
            <div className="w-full h-full flex items-center justify-center bg-red-500/20">
              <div className="text-center max-w-xs p-4">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                <p className="text-white mb-2">{scannerError}</p>
                <button onClick={() => setScannerError(null)} className="px-4 py-2 bg-blue-600 rounded-md text-sm">
                  Intentar de nuevo
                </button>
              </div>
            </div>
          ) : (
            <QRScanner onScan={handleScan} />
          )}

          {/* Overlay con líneas de escaneo */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-3/4 h-3/4 border-2 border-white/70 rounded-lg">
              {/* Esquinas para resaltar */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-white"></div>
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-white"></div>
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-white"></div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-blue-100">Alinea el código QR dentro del cuadro para escanearlo automáticamente</p>
      </div>
    </motion.div>
  )
}

