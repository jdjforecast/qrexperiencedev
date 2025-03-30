"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth"
import RouteGuard from "@/components/auth/route-guard"
import { QRScanner } from "@/components/ui/qr-scanner"
import { QRResult } from "@/components/ui/qr-result"
import { 
  PageTemplate, 
  PageContent, 
  SectionTitle, 
  ErrorMessage, 
  LoadingMessage, 
  Card 
} from "@/components/ui/page-template"
import { PageTransition, AnimateOnView } from "@/components/ui/page-transition"
import { getProductByQRCode, type Product } from "@/lib/products"
import { addToCart } from "@/lib/cart"
import { toast } from "react-hot-toast"
import { QrCode } from "lucide-react"

export default function ScanPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isScanning, setIsScanning] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)

  const handleScan = async (qrContent: string) => {
    if (!isAuthenticated || !user) {
      setError("Para guardar productos, debes iniciar sesión")
      setIsScanning(false)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Procesar el código QR para obtener información del producto
      const result = await getProductByQRCode(qrContent)

      if (!result.success || !result.data) {
        setError(result.error || "Código QR no válido o no encontrado")
        setIsScanning(false)
        return
      }

      // Verificar stock antes de continuar
      if (result.data.product.stock <= 0) {
        setError("Lo sentimos, este producto está agotado")
        setIsScanning(false)
        return
      }

      // Verificar límite por usuario si existe
      if (result.data.product.max_per_user) {
        // Aquí iría la lógica para verificar límite por usuario
        // Omitido para simplificar
      }

      // Producto escaneado correctamente
      setScannedProduct(result.data.product)
      setIsScanning(false)
    } catch (err) {
      console.error("Error scanning QR code:", err)
      setError(err instanceof Error ? err.message : "Error al procesar el código QR")
      setIsScanning(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddToCart = async (product: Product, quantity: number) => {
    if (!user) return

    try {
      const result = await addToCart(user.id, product.id, quantity)

      if (!result.success) {
        throw new Error(result.error || "Error al agregar el producto al carrito")
      }

      toast.success(`${product.name} agregado al carrito`)
      
      // Redireccionar al carrito después de un breve retraso
      setTimeout(() => {
        router.push("/cart")
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al agregar al carrito")
      throw error; // Re-lanzar el error para que el componente QRResult pueda manejarlo
    }
  }

  const handleScanError = (errorMessage: string) => {
    console.warn("QR scan error:", errorMessage)
  }

  const restartScan = () => {
    setScannedProduct(null)
    setError(null)
    setIsScanning(true)
  }

  return (
    <RouteGuard>
      <PageTemplate 
        title="ESCANEAR QR" 
        showBackButton={true} 
        activeTab="scanner"
      >
        <PageContent>
          <PageTransition type="slide-up">
            {isScanning ? (
              <Card>
                <div className="text-center mb-4">
                  <QrCode className="h-8 w-8 mx-auto mb-2 text-white/80" />
                  <SectionTitle 
                    title="Escanea un Código QR" 
                    subtitle="Apunta a un código QR para agregar productos a tu carrito" 
                    className="text-center"
                  />
                </div>
                
                {isProcessing ? (
                  <LoadingMessage message="Procesando código QR..." />
                ) : (
                  <div className="rounded-lg overflow-hidden">
                    <QRScanner 
                      onScan={handleScan} 
                      onError={handleScanError}
                      config={{
                        fps: 10, 
                        qrbox: { width: 250, height: 250 }
                      }}
                    />
                  </div>
                )}
              </Card>
            ) : error ? (
              <ErrorMessage 
                message={error}
                onRetry={restartScan}
              />
            ) : scannedProduct ? (
              <QRResult 
                product={scannedProduct}
                onAddToCart={handleAddToCart}
                onScanAgain={restartScan}
              />
            ) : null}
          </PageTransition>
          
          {/* Instrucciones para el usuario */}
          {isScanning && !isProcessing && (
            <AnimateOnView type="fade" delay={0.3}>
              <Card solid className="mt-6 p-4">
                <h3 className="font-medium mb-2 text-white">Consejos para escanear:</h3>
                <ul className="text-sm text-white/80 space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-4 h-4 bg-primary-light rounded-full mr-2 mt-0.5 flex-shrink-0"></span>
                    Asegúrate de que hay buena iluminación
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-4 h-4 bg-primary-light rounded-full mr-2 mt-0.5 flex-shrink-0"></span>
                    Mantén la cámara estable y enfocada
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-4 h-4 bg-primary-light rounded-full mr-2 mt-0.5 flex-shrink-0"></span>
                    Coloca el código QR dentro del marco
                  </li>
                </ul>
              </Card>
            </AnimateOnView>
          )}
        </PageContent>
      </PageTemplate>
    </RouteGuard>
  )
}

