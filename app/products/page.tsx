"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/auth"
import { getAllProducts } from "@/lib/products"
import RouteGuard from "@/components/auth/route-guard"
import { 
  PageTemplate, 
  PageContent, 
  SectionTitle, 
  LoadingMessage, 
  ErrorMessage, 
  Card 
} from "@/components/ui/page-template"
import { PageTransition, AnimateOnView } from "@/components/ui/page-transition"
import { Tag, ShoppingCart } from "lucide-react"

interface ProductData {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  code: string
  short_code: string
}

interface ProductsResponse {
  success: boolean
  data?: ProductData[]
  error?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        // Adaptar la respuesta al formato esperado
        const productsData = await getAllProducts()
        const result: ProductsResponse = {
          success: true,
          data: productsData.map(p => ({
            ...p,
            short_code: p.urlpage || p.id // Usar urlpage como short_code o el ID si no existe
          }))
        }

        if (result.success) {
          setProducts(result.data || [])
        } else {
          setError(result.error || "Error al cargar los productos")
        }
      } catch (err) {
        console.error("Error al cargar productos:", err)
        setError("Error inesperado al cargar los productos")
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Formatear el precio con formato de moneda
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <RouteGuard>
      <PageTemplate 
        title="Catálogo de Productos" 
        showBackButton 
        activeTab="products"
      >
        <PageTransition>
          <PageContent>
            <SectionTitle
              title="Explora nuestros productos"
              subtitle="Descubre lo que tenemos disponible para ti"
            />

            {isLoading ? (
              <LoadingMessage message="Cargando productos..." />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : products.length === 0 ? (
              <Card solid className="text-center p-8">
                <Tag className="h-12 w-12 mx-auto mb-4 text-white/50" />
                <h3 className="text-xl font-bold mb-2">No hay productos disponibles</h3>
                <p className="text-white/80 mb-4">
                  Actualmente no hay productos en nuestro catálogo. Por favor, vuelve más tarde.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <AnimateOnView 
                    key={product.id} 
                    type="fade" 
                    delay={index * 0.05}
                  >
                    <Link
                      href={`/products/${product.short_code}`}
                      className="block h-full"
                    >
                      <Card className="h-full hover-lift transition-all hover:border-white/40">
                        <div className="relative h-48 w-full rounded-t-lg overflow-hidden bg-white/10">
                          {product.image_url ? (
                            <Image
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-white/5">
                              <Tag className="h-12 w-12 text-white/30" />
                            </div>
                          )}
                          {product.stock <= 5 && product.stock > 0 && (
                            <div className="absolute top-2 right-2 bg-warning/90 text-white text-xs px-2 py-1 rounded-full">
                              ¡Quedan {product.stock}!
                            </div>
                          )}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-error/90 text-white px-3 py-1 rounded-md font-medium">
                                Agotado
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{product.name}</h3>
                          <p className="text-white/70 text-sm mb-3 line-clamp-2">
                            {product.description || "Sin descripción"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-white">{formatPrice(product.price)}</span>
                            <span className="text-sm text-white/90 flex items-center">
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Ver detalles
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </AnimateOnView>
                ))}
              </div>
            )}
          </PageContent>
        </PageTransition>
      </PageTemplate>
    </RouteGuard>
  )
}

