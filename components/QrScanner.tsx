"use client"

import { useRef, useState, useEffect } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { useAuth } from "@/hooks/auth"
import { getSupabaseClient } from "@/lib/supabase/client"
import { trackQRScan, getDeviceInfo } from "@/lib/tracking/qr-events"
import { toast } from "react-hot-toast"
import { Button } from "./ui/button"
import { Loader2, QrCode, XCircle, CheckCircle, RefreshCw } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
}

interface ScannerProps {
  onScanSuccess?: (product: Product) => void
  onScanError?: (error: string) => void
  onAddToCart?: (product: Product, quantity: number) => void
  showAddToCartButton?: boolean
}

/**
 * Componente mejorado de escaneo QR siguiendo las mejores prácticas:
 * - Feedback visual durante el escaneo
 * - Manejo de errores robusto
 * - Experiencia UX mejorada
 * - Sistema de tracking integrado
 */
export default function QrScanner({
  onScanSuccess,
  onScanError,
  onAddToCart,
  showAddToCartButton = true,
}: ScannerProps) {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [isScanning, setIsScanning] = useState(true)
  const [scanningStatus, setScanningStatus] = useState<"ready" | "scanning" | "success" | "error">("ready")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const { user } = useAuth()
  const supabase = getSupabaseClient()
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scanAttempts = useRef(0)

  // Inicializar y limpiar el escáner
  useEffect(() => {
    // Configuración del escáner optimizada para mejor rendimiento y UX
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      },
      false,
    )

    setScanningStatus("ready")

    // Iniciar el escáner
    if (scannerRef.current) {
      scannerRef.current.render(handleQrScan, handleQrError)
      setIsScanning(true)
    }

    // Limpiar el escáner cuando el componente se desmonte
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (e) {
          console.error("Error limpiando escáner:", e)
        }
      }
    }
  }, [])

  /**
   * Procesa el QR escaneado validando el formato, buscando el producto
   * y mostrando el resultado al usuario
   */
  const handleQrScan = async (decodedText: string) => {
    try {
      setScanningStatus("scanning")
      scanAttempts.current = 0

      console.log("QR escaneado:", decodedText)

      // Validar formato del QR (código alfanumérico de 8 caracteres)
      if (!decodedText.match(/^[A-Za-z0-9]{8}$/)) {
        throw new Error("Formato de QR inválido. Se esperaba un código de 8 caracteres.")
      }

      // Buscar el código QR en la base de datos
      const { data: qrData, error: qrError } = await supabase
        .from("qr_codes")
        .select(`
          id,
          product_id,
          products (*)
        `)
        .eq("code", decodedText)
        .single()

      if (qrError || !qrData) {
        console.error("Error consultando QR:", qrError)
        throw new Error("Código QR no encontrado en la base de datos")
      }

      if (!qrData.product_id || !qrData.products) {
        throw new Error("Producto asociado al QR no encontrado")
      }

      // Asegurar que el producto tenga el formato correcto
      const product = qrData.products as unknown as Product

      // Registrar escaneo exitoso
      await trackQRScan({
        qr_code_id: qrData.id,
        user_id: user?.id,
        device_info: getDeviceInfo(),
        success: true,
        action_taken: "scan",
      })

      // Actualizar contador de escaneos
      await supabase.rpc("increment_qr_scan_count", {
        qr_code_id: qrData.id,
      })

      // Mostrar producto
      setScanningStatus("success")
      setScannedProduct(product)
      setShowProductModal(true)

      // Detener escáner temporalmente
      if (scannerRef.current) {
        try {
          scannerRef.current.pause()
          setIsScanning(false)
        } catch (e) {
          console.warn("Error pausando escáner", e)
        }
      }

      // Notificar al componente padre
      if (onScanSuccess && product) {
        onScanSuccess(product)
      }
    } catch (error) {
      setScanningStatus("error")

      const errorMessage = error instanceof Error ? error.message : "Error al escanear QR"

      setErrorMessage(errorMessage)

      // Registrar escaneo fallido
      await trackQRScan({
        qr_code_id: decodedText,
        user_id: user?.id,
        device_info: getDeviceInfo(),
        success: false,
        action_taken: "error",
        error: errorMessage,
      })

      // Notificar error
      toast.error(errorMessage)

      if (onScanError) {
        onScanError(errorMessage)
      }

      // Reintentar el escaneo automáticamente en 3 segundos
      setTimeout(() => {
        if (scannerRef.current && !showProductModal) {
          setScanningStatus("ready")
          setErrorMessage(null)
          scannerRef.current.resume()
          setIsScanning(true)
        }
      }, 3000)
    }
  }

  const handleQrError = (error: string) => {
    scanAttempts.current += 1

    // Solo mostrar error después de varios intentos fallidos
    if (scanAttempts.current > 5 && scanningStatus !== "error") {
      setScanningStatus("error")

      const errorMsg = "No se detecta ningún código QR. Asegúrate de que esté bien enfocado y con buena iluminación."
      setErrorMessage(errorMsg)
      console.warn("Error al escanear:", error)

      if (onScanError) {
        onScanError(errorMsg)
      }
    }
  }

  const handleAddToCart = async (product: Product, qty = 1) => {
    try {
      // Registrar acción en tracking
      await trackQRScan({
        qr_code_id: product.id,
        user_id: user?.id,
        device_info: getDeviceInfo(),
        success: true,
        action_taken: "add_to_cart",
      })

      // Si hay un callback personalizado, usarlo
      if (onAddToCart) {
        onAddToCart(product, qty)
      } else {
        // Implementación por defecto con localStorage
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        const existingItemIndex = cart.findIndex((item: any) => item.id === product.id)

        if (existingItemIndex >= 0) {
          cart[existingItemIndex].quantity += qty
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price || 0,
            quantity: qty,
            image_url: product.image_url,
          })
        }

        localStorage.setItem("cart", JSON.stringify(cart))
      }

      toast.success(`${product.name} agregado al carrito (${qty})`)
      setShowProductModal(false)

      // Reanudar escáner
      resumeScanner()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al agregar al carrito"

      toast.error(errorMessage)
    }
  }

  const closeModal = () => {
    setShowProductModal(false)
    resumeScanner()
  }

  const resumeScanner = () => {
    if (scannerRef.current && !isScanning) {
      try {
        scannerRef.current.resume()
        setIsScanning(true)
        setScanningStatus("ready")
        setErrorMessage(null)
      } catch (e) {
        console.warn("Error reanudando escáner", e)

        // Intentar reiniciar el escáner como alternativa
        scannerRef.current.render(handleQrScan, handleQrError)
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Contenedor del escáner con overlay de estado */}
      <div className="relative rounded-lg overflow-hidden">
        <div id="reader" className="w-full"></div>

        {/* Overlay de estados */}
        {scanningStatus === "scanning" && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow flex items-center space-x-2">
              <Loader2 className="animate-spin text-primary" size={24} />
              <span>Procesando QR...</span>
            </div>
          </div>
        )}

        {scanningStatus === "error" && errorMessage && (
          <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow max-w-xs text-center">
              <XCircle className="text-red-500 mx-auto mb-2" size={32} />
              <p className="font-medium text-red-600 mb-2">Error</p>
              <p className="text-sm mb-3">{errorMessage}</p>
              <Button size="sm" onClick={resumeScanner} className="mx-auto flex items-center gap-1">
                <RefreshCw size={14} /> Reintentar
              </Button>
            </div>
          </div>
        )}
      </div>

      {scanningStatus === "ready" && !isScanning && (
        <div className="text-center mt-4">
          <Button onClick={resumeScanner} className="flex items-center gap-2">
            <QrCode size={16} /> Reactivar Escáner
          </Button>
        </div>
      )}

      {/* Modal de producto escaneado */}
      {showProductModal && scannedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full shadow-lg">
            <div className="relative">
              {scannedProduct.image_url ? (
                <img
                  src={scannedProduct.image_url}
                  alt={scannedProduct.name}
                  className="w-full h-48 object-contain rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <QrCode size={64} className="text-muted-foreground" />
                </div>
              )}

              <div className="absolute top-2 right-2">
                <div className="bg-green-500 text-white text-xs font-bold rounded-full py-1 px-2 flex items-center space-x-1">
                  <CheckCircle size={12} />
                  <span>Escaneado</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{scannedProduct.name}</h3>
            <p className="text-muted-foreground mb-4">{scannedProduct.description}</p>
            <p className="text-lg font-semibold mb-4">${scannedProduct.price.toFixed(2)}</p>

            {showAddToCartButton && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button size="sm" variant="outline" onClick={() => setQuantity(quantity + 1)}>
                    +
                  </Button>
                </div>
                <span className="text-sm font-medium">Total: ${(scannedProduct.price * quantity).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeModal}>
                Cerrar
              </Button>

              {showAddToCartButton && (
                <Button
                  onClick={() => handleAddToCart(scannedProduct, quantity)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Agregar al carrito
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

