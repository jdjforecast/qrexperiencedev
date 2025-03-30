"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { QRScanner } from "@/components/ui/qr-scanner"
import { QRResult } from "@/components/ui/qr-result"
import { LoadingMessage, ErrorMessage } from "@/components/ui/page-template"
import { PageTransition } from "@/components/ui/page-transition"
import { toast } from "react-hot-toast"
import { useAuth } from "@/hooks/auth"
import { X, QrCode } from "lucide-react"
import { addToCart } from "@/lib/cart"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  stock: number
  max_per_user?: number
  [key: string]: any
}

interface ScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onProductAdded?: (product: Product) => void
  onCoinsAdded?: (coins: number) => void
}

export function ScannerModal({ isOpen, onClose, onProductAdded, onCoinsAdded }: ScannerModalProps) {
  const [isScanning, setIsScanning] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [scannedProductId, setScannedProductId] = useState<string | null>(null)

  const { user, isAuthenticated } = useAuth()

  // Manejar el evento de escaneo
  const handleScan = async (qrContent: string) => {
    if (!isAuthenticated || !user) {
      setError("Para guardar productos, debes iniciar sesión")
      setIsScanning(false)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // En una aplicación real, aquí se procesaría el código QR para obtener el producto
      // Para demostración, creamos un producto simulado
      const mockProduct: Product = {
        id: qrContent || `product-${Math.random().toString(36).substring(2, 9)}`,
        name: "Producto Escaneado",
        description: "Este es un producto de prueba escaneado desde un código QR",
        price: 99.99,
        stock: 10,
        image_url: "https://via.placeholder.com/150",
      }

      // Guardar el ID del producto para añadirlo al carrito
      setScannedProductId(mockProduct.id)
      setScannedProduct(mockProduct)
      toast.success("Producto escaneado con éxito")
      setIsScanning(false)
    } catch (err) {
      console.error("Error al escanear código QR:", err)
      setError(err instanceof Error ? err.message : "Error al procesar el código QR")
      setIsScanning(false)
    } finally {
      setIsProcessing(false)
    }
  }

  // Manejar errores de escaneo
  const handleScanError = (errorMessage: string) => {
    console.warn("Error en escaneo:", errorMessage)
  }

  // Añadir el producto al carrito
  const handleAddToCart = async (product: Product, quantity: number) => {
    if (!user) return

    setIsProcessing(true)
    try {
      const result = await addToCart(user.id, product.id, quantity)

      if (!result.success) {
        throw new Error(result.error || "Error al agregar el producto al carrito")
      }

      toast.success(`${product.name} agregado al carrito (${quantity})`)

      // Notificar al componente padre
      if (onProductAdded) {
        onProductAdded(product)
      }

      // Cerrar el modal después de un breve retraso
      setTimeout(() => {
        handleClose()
      }, 1000)
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error(error instanceof Error ? error.message : "Error al agregar al carrito")
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset y cierre del modal
  const handleClose = () => {
    setScannedProduct(null)
    setScannedProductId(null)
    setIsScanning(true)
    setError(null)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="h-[90vh] sm:h-[85vh] md:h-[80vh] p-0 bg-primary/95 backdrop-blur-md border-white/20"
      >
        <SheetHeader className="px-4 py-3 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <QrCode className="h-5 w-5 mr-2 text-white" />
              <SheetTitle className="text-white">Escanear QR</SheetTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SheetDescription className="text-white/70">Escanea un código QR para ver el producto</SheetDescription>
        </SheetHeader>

        <div className="p-4">
          <PageTransition type="fade">
            {isScanning ? (
              <div className="space-y-4">
                {isProcessing ? (
                  <LoadingMessage message="Procesando QR..." />
                ) : (
                  <div className="rounded-lg overflow-hidden">
                    <QRScanner
                      onScan={handleScan}
                      onError={handleScanError}
                      config={{
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                      }}
                    />
                  </div>
                )}
              </div>
            ) : error ? (
              <ErrorMessage
                message={error}
                onRetry={() => {
                  setError(null)
                  setIsScanning(true)
                }}
              />
            ) : scannedProduct ? (
              <QRResult
                product={scannedProduct}
                onAddToCart={handleAddToCart}
                onScanAgain={() => {
                  setScannedProduct(null)
                  setIsScanning(true)
                }}
              />
            ) : null}
          </PageTransition>
        </div>
      </SheetContent>
    </Sheet>
  )
}

