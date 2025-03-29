"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"
import { useScanner } from "@/contexts/scanner-context"
import { QrCode, AlertCircle, Camera, KeyRound } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

type BrowserSupportStatus = {
  supported: boolean
  hasCamera: boolean
  hasCameraPermission: boolean
  hasHttps: boolean
}

export default function ScannerPage() {
  const router = useRouter()
  const { openScanner } = useScanner()
  const { isAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [browserSupport, setBrowserSupport] = useState<BrowserSupportStatus | null>(null)

  // Verificar soporte del navegador al cargar
  useEffect(() => {
    const checkBrowserSupport = async () => {
      const support: BrowserSupportStatus = {
        supported: true,
        hasCamera: false,
        hasCameraPermission: false,
        hasHttps: window.location.protocol === "https:" || window.location.hostname === "localhost",
      }

      try {
        // Verificar si mediaDevices está disponible
        if (!navigator || !navigator.mediaDevices) {
          support.supported = false
          setError("Tu navegador no soporta el acceso a la cámara")
          setBrowserSupport(support)
          return
        }

        // Verificar si hay cámaras
        try {
          const devices = await navigator.mediaDevices.enumerateDevices()
          support.hasCamera = devices.some((device) => device.kind === "videoinput")

          if (!support.hasCamera) {
            setError("No se detectó ninguna cámara en tu dispositivo")
            setBrowserSupport(support)
            return
          }

          // Intentar acceder a la cámara para verificar permisos
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          stream.getTracks().forEach((track) => track.stop())
          support.hasCameraPermission = true

          // Todo está bien
          setBrowserSupport(support)
          setError(null)
        } catch (err: any) {
          console.error("Error checking camera:", err)
          support.supported = false

          // Determinar el tipo de error específico
          if (err.name === "NotAllowedError") {
            support.hasCameraPermission = false
            setError("Permiso de cámara denegado. Permite el acceso a la cámara para usar el escáner.")
          } else if (err.name === "NotFoundError") {
            support.hasCamera = false
            setError("No se pudo acceder a la cámara de tu dispositivo.")
          } else {
            setError("Error al acceder a la cámara.")
          }

          setBrowserSupport(support)
        }
      } catch (err) {
        console.error("Error general checking support:", err)
        support.supported = false
        setError("Tu navegador no es compatible con el escáner QR")
        setBrowserSupport(support)
      }
    }

    checkBrowserSupport()
  }, [])

  const handleOpenScanner = () => {
    if (!isAuthenticated) {
      setError("Debes iniciar sesión para escanear códigos QR")
      return
    }

    // Verificar soporte antes de abrir
    if (browserSupport && !browserSupport.supported) {
      setError("Tu navegador no es compatible con el escáner QR")
      return
    }

    try {
      openScanner()
    } catch (err) {
      console.error("Error opening scanner:", err)
      setError("Error al abrir el escáner. Por favor intenta de nuevo.")
    }
  }

  const renderErrorMessage = () => {
    if (!error) return null

    let icon = <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
    let actionButton = null

    // Personalizar mensajes según el error
    if (browserSupport) {
      if (!browserSupport.hasCamera) {
        icon = <Camera className="h-12 w-12 text-red-400 mx-auto mb-4" />
      } else if (!browserSupport.hasCameraPermission) {
        icon = <KeyRound className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        actionButton = (
          <Button onClick={() => window.location.reload()} className="bg-yellow-600 hover:bg-yellow-700 mt-4">
            Volver a intentar con permisos
          </Button>
        )
      } else if (!browserSupport.hasHttps) {
        icon = <KeyRound className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
      }
    }

    return (
      <div className="mb-6">
        {icon}
        <p className="text-red-300 mb-4">{error}</p>
        {actionButton}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader title="ESCANEA EL CÓDIGO QR" onCartClick={() => router.push("/cart")} />

      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md text-center">
          {error ? renderErrorMessage() : <QrCode className="h-24 w-24 mx-auto mb-6 text-white/50" />}

          <h2 className="text-2xl font-bold mb-4">Escanea un Código QR</h2>
          <p className="text-blue-100 mb-8">Escanea códigos QR para ganar monedas o agregar productos a tu carrito</p>
          <Button
            onClick={handleOpenScanner}
            className="bg-[#0033A0] hover:bg-[#0055B8] rounded-full px-6 py-2 text-lg"
            disabled={!!error}
          >
            Abrir Escáner
          </Button>

          {!isAuthenticated && (
            <p className="mt-4 text-yellow-300 text-sm">Inicia sesión para poder escanear y guardar tus productos</p>
          )}
        </div>
      </main>

      <AppFooter activeTab="scanner" />
    </div>
  )
}

