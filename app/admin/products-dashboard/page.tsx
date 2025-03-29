"use client"

import { useState, useCallback } from "react"
import { AppHeader } from "@/components/AppHeader"
import { AppFooter } from "@/components/AppFooter"
import { ProductSelector } from "@/components/ProductSelector"
import ProductCatalogAnalytics from "@/components/ProductCatalogAnalytics"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Tag, Plus, BarChart2, FileText, ShoppingBag } from "lucide-react"

/**
 * Página de panel de control de productos
 * Muestra tanto el selector de productos como las analíticas del catálogo
 * en un flujo de trabajo integrado
 */
export default function ProductsDashboardPage() {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [displayMode, setDisplayMode] = useState<"stats" | "form">("stats")

  // Función para navegar al panel de administración
  const navigateToAdmin = () => {
    router.push("/admin")
  }

  // Manejador para la selección de producto
  const handleProductSelection = useCallback((product: any) => {
    setSelectedProduct(product)
    if (product) {
      toast({
        title: "Producto seleccionado",
        description: `Has seleccionado: ${product.name}`,
      })
    }
  }, [])

  // Cambiar categoría
  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category)
  }, [])

  // Simular actualización de producto
  const handleUpdateProduct = useCallback(() => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Selecciona un producto primero",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Producto actualizado",
      description: "Los cambios han sido guardados con éxito",
      variant: "default",
    })
  }, [selectedProduct])

  // Opciones para la demostración
  const categories = ["Electrónicos", "Ropa", "Alimentos", "Hogar"]

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader title="Dashboard de Productos" showBackButton={true} onBackClick={navigateToAdmin} />

      <main className="flex-1 container mx-auto p-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Dashboard de Productos</h1>
          <p className="text-muted-foreground">Gestiona tus productos y visualiza estadísticas del catálogo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Lateral */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Filtrar por Categoría
                </CardTitle>
                <CardDescription>Selecciona una categoría para filtrar</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedCategory || ""}
                  onValueChange={(value) => handleCategoryChange(value || null)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">
                      Todas las categorías
                    </Label>
                  </div>

                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <RadioGroupItem value={category} id={category} />
                      <Label htmlFor={category} className="cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Selector de Producto
                </CardTitle>
                <CardDescription>Selecciona un producto para editar</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductSelector
                  onSelect={handleProductSelection}
                  category={selectedCategory || undefined}
                  placeholder="Buscar un producto..."
                  showCategories={true}
                  showPrices={true}
                />

                {selectedProduct && (
                  <div className="mt-4 space-y-2">
                    <Separator />
                    <h3 className="font-medium mt-3">Producto seleccionado</h3>
                    <div className="bg-blue-500/10 p-3 rounded-md">
                      <p className="font-bold">{selectedProduct.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {selectedProduct.id}</p>
                      {selectedProduct.category && (
                        <p className="text-sm text-muted-foreground">Categoría: {selectedProduct.category}</p>
                      )}
                      <p className="text-sm font-medium mt-1">Precio: {selectedProduct.price} monedas</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" className="text-sm">
                  Nuevo Producto
                </Button>
                <Button onClick={handleUpdateProduct} disabled={!selectedProduct} className="text-sm bg-blue-600">
                  {selectedProduct ? "Editar Producto" : "Selecciona un Producto"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Panel Principal */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2" />
                    Catálogo de Productos
                  </CardTitle>
                  <Tabs
                    value={displayMode}
                    onValueChange={(v) => setDisplayMode(v as "stats" | "form")}
                    className="w-[400px]"
                  >
                    <TabsList className="grid grid-cols-2">
                      <TabsTrigger value="stats" className="flex items-center">
                        <BarChart2 className="h-4 w-4 mr-2" />
                        Estadísticas
                      </TabsTrigger>
                      <TabsTrigger value="form" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Detalles
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-auto">
                <TabsContent value="stats" className="mt-0 h-full">
                  <ProductCatalogAnalytics />
                </TabsContent>

                <TabsContent value="form" className="mt-0">
                  {selectedProduct ? (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold">Editar Producto</h2>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="product-name">Nombre del Producto</Label>
                          <Input id="product-name" defaultValue={selectedProduct.name} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="product-sku">SKU</Label>
                          <Input id="product-sku" defaultValue={selectedProduct.sku || ""} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="product-price">Precio (monedas)</Label>
                          <Input id="product-price" type="number" defaultValue={selectedProduct.price} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="product-category">Categoría</Label>
                          <select
                            id="product-category"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            defaultValue={selectedProduct.category || ""}
                          >
                            <option value="">Selecciona una categoría</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="product-description">Descripción</Label>
                        <textarea
                          id="product-description"
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue={selectedProduct.description || ""}
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline">Cancelar</Button>
                        <Button onClick={handleUpdateProduct} className="bg-blue-600">
                          Guardar Cambios
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                      <h3 className="text-xl font-medium mb-2">Ningún producto seleccionado</h3>
                      <p className="text-muted-foreground mb-4">
                        Selecciona un producto del panel lateral para ver y editar sus detalles.
                      </p>
                      <Button className="mt-2" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear nuevo producto
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AppFooter activeTab="admin" />
    </div>
  )
}

