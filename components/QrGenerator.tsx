"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { generateQRCodeSimple } from "@/lib/storage/qr-codes"
import { useAuth } from "@/hooks/auth"
import { toast } from "react-hot-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Download, QrCode, RefreshCw, Copy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface QrGeneratorProps {
  productId: string
  productName?: string
  onGenerated?: (qrData: any) => void
  className?: string
}

/**
 * Componente para generar códigos QR de forma simple y elegante.
 * Características:
 * - Genera códigos QR para productos
 * - Visualización previa del QR
 * - Opciones para descargar y compartir
 * - Manejo de errores y estados de carga
 */
export default function QrGenerator({
  productId,
  productName = "Producto",
  onGenerated,
  className = "",
}: QrGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQR, setGeneratedQR] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const generateQR = async () => {
    if (!productId) {
      toast.error("ID de producto inválido")
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      // Llamar a la función de generación optimizada
      const result = await generateQRCodeSimple(productId, user?.id || "anonymous")

      if (!result.success) {
        throw new Error(result.error || "Error generando QR")
      }

      setGeneratedQR(result)

      if (onGenerated) {
        onGenerated(result)
      }

      toast.success("Código QR generado con éxito")
    } catch (error) {
      console.error("Error generando QR:", error)
      const message = error instanceof Error ? error.message : "Error desconocido"
      setError(message)
      toast.error(`Error: ${message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQR = () => {
    if (!generatedQR?.imageUrl) return

    const link = document.createElement("a")
    link.href = generatedQR.imageUrl
    link.download = `qr_${productName.replace(/\s+/g, "_")}_${generatedQR.code}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Descargando imagen QR")
  }

  const copyQRCode = () => {
    if (!generatedQR?.code) return

    navigator.clipboard
      .writeText(generatedQR.code)
      .then(() => toast.success("Código copiado al portapapeles"))
      .catch(() => toast.error("Error al copiar el código"))
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode size={20} />
          Generador QR
        </CardTitle>
        <CardDescription>Genera un código QR único para {productName || "este producto"}</CardDescription>
      </CardHeader>

      <CardContent>
        {generatedQR ? (
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 border border-border rounded-lg p-2 mb-4 bg-white">
              {generatedQR.imageUrl ? (
                <Image
                  src={generatedQR.imageUrl}
                  alt={`QR para ${productName}`}
                  width={256}
                  height={256}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <QrCode size={64} className="text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="w-full text-center mb-4">
              <p className="text-sm text-muted-foreground mb-1">Código:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="px-2 py-1 bg-muted rounded text-lg font-mono">{generatedQR.code}</code>
                <Button size="icon" variant="ghost" onClick={copyQRCode} title="Copiar código">
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 w-full">
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={downloadQR}>
                <Download size={16} />
                Descargar
              </Button>

              {generatedQR.qrId && (
                <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                  <Link href={`/admin/qr-codes/${generatedQR.qrId || generatedQR.data?.id}`}>Ver detalles</Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            {error ? (
              <div className="text-center mb-6">
                <p className="text-red-500 mb-2">{error}</p>
                <Button variant="outline" onClick={() => setError(null)}>
                  Intentar de nuevo
                </Button>
              </div>
            ) : (
              <>
                <QrCode size={64} className="mb-4 text-muted-foreground" />
                <p className="text-center text-muted-foreground mb-4">
                  Genera un código QR único para este producto que los usuarios podrán escanear.
                </p>
                <Button onClick={generateQR} disabled={isGenerating} className="flex items-center gap-2">
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <QrCode size={16} />
                      Generar QR
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>

      {generatedQR && (
        <CardFooter className="flex justify-center border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={generateQR}
            disabled={isGenerating}
            className="flex items-center gap-1"
          >
            {isGenerating ? <LoadingSpinner size="sm" /> : <RefreshCw size={14} />}
            Regenerar QR
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

