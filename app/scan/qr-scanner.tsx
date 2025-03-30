"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { getBrowserClient } from "@/lib/supabase-client-browser"
import { useRouter } from "next/navigation"

interface QRScannerProps {
  userId?: string | null
}

export default function QRScanner({ userId }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const startScanner = async () => {
    setError(null)
    setScanResult(null)
    setScanning(true)

    try {
      if (!containerRef.current) return

      scannerRef.current = new Html5Qrcode("qr-reader")

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanSuccess,
        handleScanFailure,
      )
    } catch (err) {
      console.error("Error starting scanner:", err)
      setError("No se pudo iniciar la cámara. Por favor, verifica los permisos.")
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop()
      scannerRef.current.clear()
    }
    setScanning(false)
  }

  const handleScanSuccess = async (decodedText: string) => {
    if (processing) return
    setProcessing(true)

    try {
      await stopScanner()
      setScanResult(decodedText)

      if (userId) {
        await recordScanEvent(decodedText, userId)
      }

      // Intentar procesar el código QR
      await processQRCode(decodedText)
    } catch (err) {
      console.error("Error processing scan:", err)
      setError("Error al procesar el código QR")
    } finally {
      setProcessing(false)
    }
  }

  const handleScanFailure = (error: string) => {
    // No mostrar errores durante el escaneo normal
    console.debug("Scan error (normal during scanning):", error)
  }

  const recordScanEvent = async (qrCode: string, userId: string) => {
    try {
      const supabase = getBrowserClient()

      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenSize: `${window.screen.width}x${window.screen.height}`,
      }

      await supabase.from("qr_scan_events").insert({
        qr_code_id: qrCode,
        user_id: userId,
        scanned_at: new Date().toISOString(),
        device_info: deviceInfo,
        success: true,
        action_taken: "scan",
      })

      console.log("Scan event recorded successfully")
    } catch (err) {
      console.error("Error recording scan event:", err)
      // No interrumpir el flujo principal si falla el registro
    }
  }

  const processQRCode = async (qrCode: string) => {
    try {
      // Verificar si es un código de producto
      if (qrCode.startsWith("PROD:")) {
        const productCode = qrCode.replace("PROD:", "")
        window.location.href = `/products/${productCode}`
        return
      }

      // Verificar si es una URL
      if (qrCode.startsWith("http")) {
        window.open(qrCode, "_blank")
        return
      }

      // Si no es ninguno de los anteriores, mostrar el resultado
      console.log("QR Code processed:", qrCode)
    } catch (err) {
      console.error("Error processing QR code:", err)
      setError("Error al procesar el código QR")
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} id="qr-reader" className="w-full max-w-md"></div>

      {!scanning && !scanResult && !error && (
        <button onClick={startScanner} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Iniciar Escaneo
        </button>
      )}

      {scanning && (
        <button onClick={stopScanner} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
          Detener Escaneo
        </button>
      )}

      {scanResult && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-md">
          <p className="font-semibold">Código escaneado:</p>
          <p className="break-all">{scanResult}</p>
          <button
            onClick={() => {
              setScanResult(null)
              setError(null)
              startScanner()
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Escanear Otro
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => {
              setError(null)
              startScanner()
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Intentar Nuevamente
          </button>
        </div>
      )}
    </div>
  )
}

