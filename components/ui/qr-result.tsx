"use client"
import { Check, AlertCircle, Coins, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

type QRResultProps = {
  result: {
    success: boolean
    message: string
    type?: "product" | "coins"
    data?: any
  } | null
  userId: string | null
  onLogin: () => void
  onClose: () => void
  onScanAgain: () => void
  onAddToCart?: () => Promise<void>
  isProcessing?: boolean
}

export function QRResult({
  result,
  userId,
  onLogin,
  onClose,
  onScanAgain,
  onAddToCart,
  isProcessing = false,
}: QRResultProps) {
  if (!result) return null

  const showProductDetails = result.success && result.type === "product" && result.data?.product

  // Resultado exitoso
  if (result.success) {
    // Monedas escaneadas
    if (result.type === "coins" && result.data?.coins) {
      return (
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="h-10 w-10 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">{result.message}</h3>
          <p className="text-blue-100 mb-6">Has escaneado un código de monedas</p>

          <Button onClick={onScanAgain} className="w-full">
            Escanear otro código
          </Button>
        </div>
      )
    }

    // Producto escaneado
    if (result.type === "product" && result.data?.product) {
      const product = result.data.product

      return (
        <div>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold">¡Producto encontrado!</h3>
              <p className="text-sm text-blue-200">Listo para agregar al carrito</p>
            </div>
          </div>

          {/* Detalles del producto */}
          <div className="bg-blue-900/30 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              {product.image_url ? (
                <div className="w-16 h-16 rounded-md overflow-hidden mr-3 bg-white/10 flex items-center justify-center">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-md overflow-hidden mr-3 bg-white/10 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white/50" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold">{product.name}</h4>
                <p className="text-sm text-blue-200">{formatCurrency(product.price)}</p>
                {product.stock > 0 && (
                  <div className="mt-1 flex items-center">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                      {product.stock} en stock
                    </span>
                    {product.max_per_user && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded ml-2">
                        Máx: {product.max_per_user}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={onAddToCart} disabled={isProcessing} className="w-full">
              {isProcessing ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Agregando...
                </span>
              ) : (
                <span className="flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar al carrito
                </span>
              )}
            </Button>

            <Button variant="outline" onClick={onScanAgain} className="w-full">
              Escanear otro código
            </Button>
          </div>
        </div>
      )
    }

    // Éxito genérico (caso poco común)
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">{result.message}</h3>

        <Button onClick={onScanAgain} className="w-full mt-4">
          Escanear otro código
        </Button>
      </div>
    )
  }

  // Resultado de error
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-red-300 mb-2">Ocurrió un error</h3>
      <p className="text-blue-100 mb-6">{result.message}</p>

      <Button onClick={onScanAgain} className="w-full">
        Intentar de nuevo
      </Button>
    </div>
  )
}

