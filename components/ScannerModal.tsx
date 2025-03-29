"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertCircle, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QRScannerView } from "@/components/ui/qr-scanner-view"
import { QRResult } from "@/components/ui/qr-result"
import { getProductByQRCode } from "@/lib/products"
import { addToCart } from "@/lib/cart"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { toast } from "@/components/ui/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import type { Product } from "@/types/product"

// Tipos para los resultados del escaneo
type ScanResultType = "product" | "coins" | "error"

interface ScanResultData {
  product?: Product
  coins?: number
  errorMessage?: string
}

interface ScanResult {
  success: boolean
  message: string
  type?: ScanResultType
  data?: ScanResultData
}

interface ScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onProductAdded?: (product: Product) => void
  onCoinsAdded?: (coins: number) => void
}

/**
 * Componente para mostrar mensajes de error
 */
function ErrorMessage({ message, onLogin }: { message: string; onLogin?: () => void }) {
  const needsLogin = message.includes("iniciar sesión")

  return (
    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
        <p>{message}</p>
      </div>
      {needsLogin && onLogin && (
        <Button onClick={onLogin} className="mt-2 w-full bg-blue-600 hover:bg-blue-700" size="sm">
          <LogIn className="h-4 w-4 mr-2" /> Iniciar sesión
        </Button>
      )}
    </div>
  )
}

/**
 * Componente para mostrar la cabecera del modal
 */
function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-blue-700/40">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <button
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-800/50 hover:bg-blue-700/70 text-white"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

/**
 * Componente principal del modal de escaneo
 */
export function ScannerModal({ isOpen, onClose, onProductAdded, onCoinsAdded }: ScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedProductId, setScannedProductId] = useState<string | null>(null)

  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  /**
   * Maneja el resultado de un escaneo de QR
   */
  const handleScan = async (qrContent: string) => {
    if (!isAuthenticated || !user) {
      setError("Para guardar productos o monedas, debes iniciar sesión")
      return
    }

    setIsProcessing(true)
    setError(null)
    setScannedProductId(null)

    try {
      // Procesar QR code para obtener información del producto
      const { data, error: processError } = await getProductByQRCode(qrContent)

      if (processError || !data) {
        console.error("Error procesando QR:", processError)
        setScanResult({
          success: false,
          message: processError instanceof Error ? processError.message : "Código QR no válido o no encontrado",
          type: "error",
          data: { errorMessage: processError?.toString() },
        })
        return
      }

      // Si el QR da monedas
      if (data.coinsValue && data.coinsValue > 0) {
        if (onCoinsAdded) {
          onCoinsAdded(data.coinsValue)
        }

        setScanResult({
          success: true,
          message: `¡Has ganado ${data.coinsValue} monedas!`,
          type: "coins",
          data: { coins: data.coinsValue },
        })
      }
      // Si el QR es para un producto
      else if (data.product) {
        // Verificar stock antes de continuar
        if (data.product.stock <= 0) {
          setScanResult({
            success: false,
            message: "Lo sentimos, este producto está agotado",
            type: "error",
            data: { product: data.product, errorMessage: "Producto agotado" },
          })
          return
        }

        // Verificar límite por usuario
        if (data.product.max_per_user) {
          const supabase = getBrowserClient()
          const { data: cartItems, error: cartError } = await supabase
            .from("cart_items")
            .select("quantity")
            .eq("user_id", user.id)
            .eq("product_id", data.product.id)
            .single()

          if (!cartError && cartItems && cartItems.quantity >= data.product.max_per_user) {
            setScanResult({
              success: false,
              message: `Ya has alcanzado el límite de ${data.product.max_per_user} unidades para este producto`,
              type: "error",
              data: { product: data.product, errorMessage: "Límite de unidades alcanzado" },
            })
            return
          }
        }

        // Guardar el ID del producto para añadirlo al carrito
        setScannedProductId(data.product.id)

        setScanResult({
          success: true,
          message: `¡Producto escaneado con éxito!`,
          type: "product",
          data: { product: data.product },
        })
      } else {
        setScanResult({
          success: false,
          message: "Código QR no válido o sin información del producto",
          type: "error",
          data: { errorMessage: "QR sin información válida" },
        })
      }
    } catch (err) {
      console.error("Error scanning QR code:", err)
      setScanResult({
        success: false,
        message: err instanceof Error ? err.message : "Error al procesar el código QR",
        type: "error",
        data: { errorMessage: err instanceof Error ? err.message : "Error desconocido" },
      })
    } finally {
      setIsProcessing(false)
      setIsScanning(false)
    }
  }

  /**
   * Añade el producto escaneado al carrito
   */
  const handleAddToCart = async () => {
    if (!user || !scannedProductId) return

    setIsProcessing(true)
    try {
      // Añadir al carrito con validación de stock
      const { error: cartError } = await addToCart(user.id, scannedProductId)

      if (cartError) {
        setScanResult({
          success: false,
          message: cartError instanceof Error ? cartError.message : "Error al agregar el producto al carrito",
          type: "error",
          data: { errorMessage: cartError?.toString() },
        })
        return
      }

      // Obtener el producto actual del resultado
      const currentProduct = scanResult?.data?.product

      // Notificar al componente padre
      if (onProductAdded && currentProduct) {
        onProductAdded(currentProduct)
      }

      // Actualizar mensaje
      setScanResult({
        ...scanResult!,
        message: `¡${currentProduct?.name || "Producto"} agregado al carrito!`,
      })

      // Mostrar toast de éxito
      toast({
        title: "Producto agregado",
        description: `${currentProduct?.name || "Producto"} agregado al carrito`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      setScanResult({
        success: false,
        message: error instanceof Error ? error.message : "Error al agregar el producto al carrito",
        type: "error",
        data: { errorMessage: error instanceof Error ? error.message : "Error desconocido" },
      })

      // Mostrar toast de error
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar el producto",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Inicia el proceso de escaneo
   */
  const startScanning = () => {
    setScanResult(null)
    setError(null)
    setScannedProductId(null)
    setIsScanning(true)
  }

  /**
   * Redirige al usuario a la página de login
   */
  const handleLogin = () => {
    onClose()
    router.push("/login?redirect=/scanner")
  }

  /**
   * Cierra el modal y reinicia el estado
   */
  const handleClose = () => {
    setIsScanning(false)
    setScanResult(null)
    setError(null)
    setScannedProductId(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        key="scanner-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        onClick={handleClose}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="w-full max-w-md bg-gradient-to-b from-blue-900/95 to-blue-800/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader title="Escanear Código QR" onClose={handleClose} />

          <div className="p-4">
            {error && <ErrorMessage message={error} onLogin={handleLogin} />}

            {isScanning && !scanResult && <QRScannerView onDetect={handleScan} isLoading={isProcessing} />}

            {!isScanning && !scanResult && (
              <div className="text-center">
                <p className="text-white/80 mb-4">
                  Escanea un código QR para añadir un producto a tu carrito o ganar monedas.
                </p>
                <Button
                  onClick={startScanning}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                >
                  Iniciar escaneo
                </Button>
              </div>
            )}

            {scanResult && (
              <QRResult
                success={scanResult.success}
                message={scanResult.message}
                product={scanResult.data?.product}
                coins={scanResult.data?.coins}
                isLoading={isProcessing}
                onAddToCart={scanResult.success && scanResult.type === "product" ? handleAddToCart : undefined}
                onScanAgain={startScanning}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

