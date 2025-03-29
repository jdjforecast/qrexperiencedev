"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QrScanner from "@/components/QrScanner"
import QrGenerator from "@/components/QrGenerator"
import ProductDisplay from "@/components/ProductDisplay"
import { toast } from "react-hot-toast"
import { getProductById } from "@/lib/api/products"
import { BackButton } from "@/components/BackButton"
import { QrCode, Smartphone, TestTube, Database } from "lucide-react"

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
  const [generatedQR, setGeneratedQR] = useState<any | null>(null)

  // Función para manejar el escaneo exitoso de un QR
  const handleScanSuccess = async (product: Product) => {
    console.log("QR escaneado exitosamente:", product)

    if (product) {
      setScannedProduct(product)
    }
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

  // Función para manejar la generación exitosa de un QR
  const handleQRGenerated = (qrData: any) => {
    setGeneratedQR(qrData)
    console.log("QR generado:", qrData)
  }

  return (
    <div className="container py-8 px-4">
      <BackButton />
      <div className="flex items-center gap-2 mb-2">
        <TestTube className="text-primary" size={24} />
        <h1 className="text-3xl font-bold">Laboratorio QR</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-8">
        Prueba y diagnostica la funcionalidad de códigos QR en un entorno controlado.
      </p>

      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="scanner" className="flex items-center gap-1">
            <Smartphone size={16} />
            Escáner QR
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-1">
            <QrCode size={16} />
            Generador QR
          </TabsTrigger>
          <TabsTrigger value="product-test" className="flex items-center gap-1">
            <Database size={16} />
            Cargar Producto
          </TabsTrigger>
          {scannedProduct && (
            <TabsTrigger value="product" className="flex items-center gap-1">
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
              <QrScanner
                onScanSuccess={handleScanSuccess}
                onScanError={(error) => {
                  console.error("Error escaneando QR:", error)
                  toast.error(error)
                }}
                onAddToCart={handleAddToCart}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de QR</CardTitle>
                <CardDescription>Ingresa un ID de producto para generar su QR</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">ID del Producto</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Ingresa el ID del producto"
                        value={testProductId}
                        onChange={(e) => setTestProductId(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadTestProduct}
                        disabled={isLoadingProduct || !testProductId}
                      >
                        Verificar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      El ID debe corresponder a un producto existente en la base de datos.
                    </p>
                  </div>

                  {scannedProduct && (
                    <div className="border p-3 rounded-md">
                      <h3 className="font-medium mb-1">{scannedProduct.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{scannedProduct.description}</p>
                      <p className="text-sm font-semibold">${scannedProduct.price?.toFixed(2) || "0.00"}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {testProductId && (
              <QrGenerator
                productId={testProductId}
                productName={scannedProduct?.name || "Producto de prueba"}
                onGenerated={handleQRGenerated}
              />
            )}
          </div>
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
    </div>
  )
}

