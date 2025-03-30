"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRScanner } from "@/components/ui/qr-scanner"
import ProductDisplay from "@/components/ProductDisplay"
import { toast } from "react-hot-toast"
import { getProductById } from "@/lib/api/products"
import { QrCode, Smartphone, TestTube, Database, Loader2 } from "lucide-react"
import { PageTemplate, PageContent } from "@/components/ui/page-template"

interface Product {
  id: string
  name: string
  description?: string
  price?: number
  image_url?: string
}

export default function QRTestPage() {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  const [testProductId, setTestProductId] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  // Función para manejar el escaneo exitoso de un QR
  const handleScan = async (decodedText: string) => {
    setIsScanning(true)
    setScanError(null)

    try {
      console.log("QR escaneado:", decodedText)

      // Simulando un producto escaneado para pruebas
      // En un caso real, aquí llamarías a una API con el código QR
      const mockProduct: Product = {
        id: "test-" + Math.random().toString(36).substring(2, 9),
        name: "Producto de Prueba",
        description: "Este es un producto de prueba escaneado con el código: " + decodedText,
        price: 99.99,
        image_url: "https://via.placeholder.com/150",
      }

      setScannedProduct(mockProduct)
      toast.success("QR escaneado con éxito")
    } catch (error) {
      console.error("Error en escaneo:", error)
      setScanError("Error procesando el código QR")
      toast.error("Error al procesar el código QR")
    } finally {
      setIsScanning(false)
    }
  }

  // Función para manejar errores de escaneo
  const handleScanError = (errorMessage: string) => {
    console.error("Error escaneando QR:", errorMessage)
    setScanError(errorMessage)
  }

  // Función para añadir un producto al carrito
  const handleAddToCart = (productId: string, quantity: number) => {
    if (!scannedProduct) return

    try {
      // Lógica para añadir al carrito (localStorage como ejemplo)
      const cart = JSON.parse(localStorage.getItem("cart") || "[]")
      const existingItem = cart.find((item: any) => item.id === productId)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        cart.push({
          id: productId,
          name: scannedProduct.name,
          price: scannedProduct.price || 0,
          quantity,
          image_url: scannedProduct.image_url,
        })
      }

      localStorage.setItem("cart", JSON.stringify(cart))

      toast.success(`${scannedProduct.name} se ha añadido al carrito (${quantity} unidad(es))`)
    } catch (error) {
      console.error("Error añadiendo al carrito:", error)
      toast.error("No se pudo añadir el producto al carrito")
    }
  }

  // Función para cargar un producto para pruebas
  const loadTestProduct = async () => {
    if (!testProductId) {
      toast.error("Ingresa un ID de producto válido")
      return
    }

    setIsLoadingProduct(true)

    try {
      const product = await getProductById(testProductId)
      if (!product) {
        throw new Error("Producto no encontrado")
      }

      setScannedProduct(product)
      toast.success("Producto cargado con éxito")
    } catch (error) {
      console.error("Error cargando producto:", error)
      toast.error(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsLoadingProduct(false)
    }
  }

  return (
    <PageTemplate title="Laboratorio QR" showBackButton>
      <PageContent>
        <div className="flex items-center gap-2 mb-4">
          <TestTube className="text-white" size={24} />
          <h2 className="text-xl font-bold">Prueba y diagnóstico de códigos QR</h2>
        </div>

        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="scanner" className="flex items-center gap-1">
              <Smartphone size={16} />
              Escáner QR
            </TabsTrigger>
            <TabsTrigger value="product-test" className="flex items-center gap-1">
              <Database size={16} />
              Cargar Producto
            </TabsTrigger>
            {scannedProduct && (
              <TabsTrigger value="product" className="flex items-center gap-1">
                <QrCode size={16} />
                Ver Producto
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="scanner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone size={20} />
                  Escanear QR
                </CardTitle>
                <CardDescription>Usa la cámara para escanear un código QR</CardDescription>
              </CardHeader>
              <CardContent>
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p className="text-gray-600">Procesando QR...</p>
                  </div>
                ) : (
                  <QRScanner
                    onScan={handleScan}
                    onError={handleScanError}
                    config={{
                      fps: 10,
                      qrbox: { width: 250, height: 250 },
                    }}
                  />
                )}
                {scanError && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
                    <p className="font-medium">Error</p>
                    <p>{scanError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="product-test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cargar Producto para Pruebas</CardTitle>
                <CardDescription>Ingresa un ID de producto para cargarlo directamente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="ID del producto"
                    value={testProductId}
                    onChange={(e) => setTestProductId(e.target.value)}
                  />
                  <Button onClick={loadTestProduct} disabled={isLoadingProduct || !testProductId}>
                    {isLoadingProduct ? "Cargando..." : "Cargar"}
                  </Button>
                </div>

                <Separator />

                {scannedProduct ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Producto Cargado</h3>
                    <ProductDisplay product={scannedProduct} onAddToCart={handleAddToCart} />
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Ingresa un ID de producto y haz clic en "Cargar" para ver los detalles.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {scannedProduct && (
            <TabsContent value="product">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Producto</CardTitle>
                  <CardDescription>Información completa y opciones para añadir al carrito</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductDisplay product={scannedProduct} onAddToCart={handleAddToCart} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </PageContent>
    </PageTemplate>
  )
}

