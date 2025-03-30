"use client"

import { useRef, useState, useEffect } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { useAuth } from "@/hooks/auth"
import { trackQRScan, getDeviceInfo } from "@/lib/tracking/qr-events"
import { getProductClientSide } from "@/lib/product-service"
import { toast } from "react-hot-toast"
import { Button } from "./ui/button"
import { Loader2, QrCode, XCircle, CheckCircle, RefreshCw } from "lucide-react"
import { ProductData } from "@/types/cart"
import { ProductDataSchema } from "@/types/schemas"

interface ScannerProps {
  onScanSuccess?: (product: ProductData) => void
  onScanError?: (error: string) => void
  onAddToCart?: (product: ProductData, quantity: number) => void
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
  const [scannedProduct, setScannedProduct] = useState<ProductData | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [isScanning, setIsScanning] = useState(true)
  const [scanningStatus, setScanningStatus] = useState<"ready" | "scanning" | "success" | "error">("ready")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const { user } = useAuth()
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

  // Extract product ID from URL
  const extractProductIdFromUrl = (url: string): string | null => {
    try {
      const urlObject = new URL(url);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || window.location.origin;
      const appOrigin = new URL(appUrl).origin;

      // Check if it's a URL from our app and matches the product path
      if (urlObject.origin === appOrigin && urlObject.pathname.startsWith("/product/")) {
        const pathParts = urlObject.pathname.split('/');
        // Expecting /product/[id], so id should be the 3rd part (index 2)
        if (pathParts.length >= 3 && pathParts[2]) {
          return pathParts[2]; // This could be the UUID or the urlpage slug
        }
      }
    } catch (e) {
      // Not a valid URL, might be a raw ID or code (handle later if needed)
      console.warn("Scanned text is not a valid URL:", url)
    }
    return null;
  }

  /**
   * Procesa el QR escaneado validando el formato, buscando el producto
   * y mostrando el resultado al usuario
   */
  const handleQrScan = async (decodedText: string) => {
    try {
      setScanningStatus("scanning")
      scanAttempts.current = 0
      console.log("QR scanned (expecting URL):", decodedText)

      // 1. Extract Product ID/Slug from URL
      const productIdOrSlug = extractProductIdFromUrl(decodedText);
      if (!productIdOrSlug) {
        throw new Error("Código QR no contiene una URL de producto válida.");
      }

      // 2. Fetch Product Data using the extracted ID/Slug
      const productResult = await getProductClientSide(productIdOrSlug);

      if (!productResult.success) {
        // Distinguish between not found and other errors
        if (productResult.productNotFound) {
           throw new Error("Producto no encontrado para este código QR.");
        } else {
           throw new Error(productResult.error || "Error al buscar el producto.");
        }
      }

      // 3. Get validated product data
      const product: ProductData = productResult.data;

      // 4. Track Scan Event
      await trackQRScan({
        qr_code_id: decodedText, // Track the original scanned URL
        user_id: user?.id,
        device_info: getDeviceInfo(),
        success: true,
        action_taken: "scan",
      });

      // 5. Update state and show modal
      setScanningStatus("success")
      setScannedProduct(product)
      setShowProductModal(true)
      setQuantity(1);

      // Pause scanner
      if (scannerRef.current) {
          try {
              scannerRef.current.pause();
              setIsScanning(false);
          } catch (e) { console.warn("Error pausing scanner", e); }
      }

      // Notify parent (optional)
      if (onScanSuccess) {
        onScanSuccess(product)
      }

    } catch (error) {
      setScanningStatus("error")
      const errorMessage = error instanceof Error ? error.message : "Error al procesar QR"
      setErrorMessage(errorMessage)

      // Track Scan Failure
      await trackQRScan({
        qr_code_id: decodedText,
        user_id: user?.id,
        device_info: getDeviceInfo(),
        success: false,
        action_taken: "error",
        error: errorMessage,
      })

      toast.error(errorMessage)
      if (onScanError) { onScanError(errorMessage) }

      // Automatic retry logic (keep for now)
      setTimeout(() => {
        if (scannerRef.current && !showProductModal) {
            setScanningStatus("ready");
            setErrorMessage(null);
            try {
                scannerRef.current.resume();
                setIsScanning(true);
            } catch (e) { console.warn("Error resuming scanner after error", e); }
        }
      }, 3000);
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

  const handleAddToCart = async (product: ProductData, qty = 1) => {
    if (!onAddToCart) {
      console.error("QrScanner: onAddToCart prop is missing, cannot add item.");
      toast.error("Error: No se pudo agregar el producto al carrito.");
      return; // Exit if the callback is not provided
    }

    try {
      // Track action (use validated product data)
      await trackQRScan({
        qr_code_id: product.id, // Or qrData.id if available? Using product.id for now
        user_id: user?.id,
        device_info: getDeviceInfo(),
        success: true,
        action_taken: "add_to_cart",
      })

      // Call the provided callback to handle adding to cart via service
      onAddToCart(product, qty)

      toast.success(`${product.name} agregado al carrito (${qty})`)
      setShowProductModal(false)

      // Resume scanning after adding to cart and closing modal
      // Ensure scanner is only resumed if it was paused and modal is closed
      setTimeout(() => {
        if (scannerRef.current && !showProductModal && !isScanning) {
          try {
            scannerRef.current.resume();
            setIsScanning(true);
            setScanningStatus("ready");
            setErrorMessage(null);
          } catch (e) {
            console.warn("Error resuming scanner after add to cart", e);
          }
        }
      }, 500); // Short delay to allow modal to close

    } catch (error) {
      console.error("Error during AddToCart callback or tracking:", error);
      toast.error("Error al agregar al carrito.");
      // Optionally call onScanError here too?
    }
  }

  const closeModalAndResume = () => {
    setShowProductModal(false)
    setScannedProduct(null)
    // Resume scanning if it's not already running
    if (scannerRef.current && !isScanning) {
        try {
            scannerRef.current.resume();
            setIsScanning(true);
            setScanningStatus("ready");
            setErrorMessage(null);
        } catch (e) {
            console.warn("Error resuming scanner from modal close", e);
        }
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto p-4 border rounded-lg shadow-lg bg-gray-800 text-white">
      {/* Scanner container */}
      <div id="reader" className={`${showProductModal ? 'hidden' : ''}`}></div>
      
      {/* Status Overlay */} 
      {!showProductModal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 pointer-events-none">
              {scanningStatus === 'scanning' && <Loader2 className="animate-spin h-12 w-12 text-blue-400" />}
              {scanningStatus === 'error' && <XCircle className="h-16 w-16 text-red-500 mb-2" />}
              {scanningStatus === 'error' && errorMessage && <p className="text-center text-red-400 mt-2 px-4">{errorMessage}</p>}
              {scanningStatus === 'ready' && <QrCode className="h-16 w-16 text-gray-400 animate-pulse" />}
          </div>
      )}

      {/* Product Modal */} 
      {showProductModal && scannedProduct && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-95 p-4 flex flex-col items-center justify-center z-10">
          <h3 className="text-xl font-bold mb-3 text-center">{scannedProduct.name}</h3>
          {scannedProduct.image_url && (
            <img 
              src={scannedProduct.image_url} 
              alt={scannedProduct.name} 
              className="w-32 h-32 object-cover rounded-md mb-4 border border-gray-600"
            />
          )}
          <p className="text-lg font-semibold mb-4">${scannedProduct.price?.toFixed(2) ?? 'N/A'}</p>
          {/* Quantity Selector */} 
          <div className="flex items-center justify-center space-x-3 mb-5">
            <Button size="icon" variant="outline" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>-</Button>
            <span className="text-xl font-semibold w-10 text-center">{quantity}</span>
            <Button size="icon" variant="outline" onClick={() => setQuantity(q => q + 1)} disabled={quantity >= (scannedProduct.stock ?? 99)}>+</Button> 
          </div>
          {/* Stock Info */} 
          <p className="text-sm text-gray-400 mb-5">
            {scannedProduct.stock !== null && scannedProduct.stock > 0 
              ? `Stock disponible: ${scannedProduct.stock}` 
              : <span className="text-red-400">Agotado</span>}
          </p>

          {/* Action Buttons */} 
          <div className="w-full space-y-3">
            {showAddToCartButton && scannedProduct.stock !== null && scannedProduct.stock > 0 && (
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => handleAddToCart(scannedProduct, quantity)}
              >
                Agregar {quantity} al Carrito
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full border-gray-600 hover:bg-gray-700"
              onClick={closeModalAndResume}
            >
              {isScanning ? 'Cerrar' : 'Escanear Otro'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

