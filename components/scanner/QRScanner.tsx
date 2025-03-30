"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { useRouter } from "next/navigation"

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerDivRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Cleanup function to stop scanner when component unmounts
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err) => {
          console.error("Error stopping scanner:", err)
        })
      }
    }
  }, [])

  const startScanner = async () => {
    setError(null)

    if (!scannerDivRef.current) {
      setError("Scanner initialization failed")
      return
    }

    try {
      const scanner = new Html5Qrcode("qr-reader")
      scannerRef.current = scanner

      setIsScanning(true)

      const qrCodeSuccessCallback = (decodedText: string) => {
        // Stop scanning after successful scan
        stopScanner()

        // Handle the scanned URL
        try {
          // Check if it's a valid URL
          const url = new URL(decodedText)

          // Check if it's a product URL from our domain
          if (url.pathname.startsWith("/products/")) {
            router.push(decodedText)
          } else {
            setError("QR code does not contain a valid product URL")
          }
        } catch (err) {
          setError("Invalid QR code content")
        }
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await scanner.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, (errorMessage) => {
        // This is a non-fatal error, so we don't need to stop scanning
        console.log("QR code scanning error:", errorMessage)
      })
    } catch (err) {
      console.error("Error starting scanner:", err)
      setError("Could not start camera. Please check permissions.")
      setIsScanning(false)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div id="qr-reader" ref={scannerDivRef} className="w-full max-w-md overflow-hidden rounded-lg"></div>

      {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      <div className="mt-6">
        {!isScanning ? (
          <button
            onClick={startScanner}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Iniciar Escaneo QR
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Detener Escaneo
          </button>
        )}
      </div>
    </div>
  )
}

