"use client"

import { useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertTriangle, TrendingUp, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDataLoader } from "@/hooks/use-data-loader"
import { toast } from "@/components/ui/use-toast"

interface ProductStat {
  categoryName: string
  totalProducts: number
  avgPrice: number
  lowestPrice: number
  highestPrice: number
  totalValue: number
}

/**
 * Componente para mostrar análisis y estadísticas del catálogo de productos
 * Utiliza el hook useDataLoader para obtener y procesar los datos con manejo
 * de cache y reintentos automáticos
 */
export default function ProductCatalogAnalytics() {
  // Simular una API para obtener estadísticas de productos por categoría
  const fetchProductStats = useCallback(async () => {
    // En un caso real, esto sería una llamada a la API
    // Simulamos un retraso para demostrar el estado de carga
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock data - en una implementación real, esto vendría de la API
    const mockStats: ProductStat[] = [
      {
        categoryName: "Electrónicos",
        totalProducts: 24,
        avgPrice: 450,
        lowestPrice: 120,
        highestPrice: 1200,
        totalValue: 10800,
      },
      {
        categoryName: "Ropa",
        totalProducts: 36,
        avgPrice: 85,
        lowestPrice: 25,
        highestPrice: 320,
        totalValue: 3060,
      },
      {
        categoryName: "Alimentos",
        totalProducts: 18,
        avgPrice: 30,
        lowestPrice: 5,
        highestPrice: 120,
        totalValue: 540,
      },
      {
        categoryName: "Hogar",
        totalProducts: 42,
        avgPrice: 150,
        lowestPrice: 45,
        highestPrice: 650,
        totalValue: 6300,
      },
    ]

    return mockStats
  }, [])

  // Callbacks para gestionar estados del hook
  const handleStatsSuccess = useCallback((data: ProductStat[]) => {
    toast({
      title: "Datos actualizados",
      description: `Se cargaron estadísticas de ${data.length} categorías`,
      variant: "default",
    })
  }, [])

  const handleStatsError = useCallback((error: Error) => {
    toast({
      title: "Error al cargar estadísticas",
      description: error.message,
      variant: "destructive",
    })
  }, [])

  // Usar nuestro hook mejorado para cargar las estadísticas
  const {
    data: productStats = [],
    isLoading,
    error,
    refetch,
    isFromCache,
    lastUpdated,
    abort,
  } = useDataLoader({
    fetcher: fetchProductStats,
    cacheKey: "product-catalog-stats",
    cacheDuration: 15 * 60 * 1000, // 15 minutos
    retryCount: 2,
    retryDelay: 1000,
    timeout: 5000,
    onSuccess: handleStatsSuccess,
    onError: handleStatsError,
  })

  // Calcular resumen general
  const catalogSummary = useCallback(() => {
    if (!productStats.length) return null

    return {
      totalCategories: productStats.length,
      totalProducts: productStats.reduce((sum, stat) => sum + stat.totalProducts, 0),
      totalValue: productStats.reduce((sum, stat) => sum + stat.totalValue, 0),
      avgPriceOverall: productStats.reduce((sum, stat) => sum + stat.avgPrice, 0) / productStats.length,
    }
  }, [productStats])

  const summary = catalogSummary()

  // Obtener la categoría con más productos
  const topCategory = useCallback(() => {
    if (!productStats.length) return null

    return productStats.reduce((prev, current) => (prev.totalProducts > current.totalProducts ? prev : current))
  }, [productStats])

  // Obtener la categoría con precio promedio más alto
  const mostExpensiveCategory = useCallback(() => {
    if (!productStats.length) return null

    return productStats.reduce((prev, current) => (prev.avgPrice > current.avgPrice ? prev : current))
  }, [productStats])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Análisis del Catálogo</h2>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Button variant="outline" size="sm" onClick={abort}>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cancelar
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={refetch}>
              Actualizar
            </Button>
          )}
        </div>
      </div>

      {/* Información de caché */}
      {isFromCache && lastUpdated && (
        <div className="text-xs text-blue-400 mb-2 flex items-center">
          <span className="inline-block p-1 bg-blue-100/10 rounded mr-2">CACHÉ</span>
          Última actualización: {lastUpdated.toLocaleString()}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
          <div>
            <h3 className="font-medium">Error al cargar estadísticas</h3>
            <p className="text-sm opacity-80">{error.message}</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-52 bg-blue-500/5 rounded-lg border border-blue-200/10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2 mx-auto text-blue-500" />
            <p className="text-sm">Cargando estadísticas del catálogo...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Resumen General */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-300">Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalCategories}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-300">Total Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalProducts}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-300">Valor Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalValue.toLocaleString()} monedas</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-300">Precio Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.avgPriceOverall.toFixed(2)} monedas</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Estadísticas por Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productStats.map((stat) => (
              <Card key={stat.categoryName} className="overflow-hidden">
                <CardHeader className="bg-blue-900/20 pb-2">
                  <CardTitle className="text-lg">{stat.categoryName}</CardTitle>
                  <CardDescription>{stat.totalProducts} productos</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Precio Prom.</p>
                      <p className="font-medium">{stat.avgPrice.toFixed(2)} monedas</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Precio Min.</p>
                      <p className="font-medium">{stat.lowestPrice.toFixed(2)} monedas</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Precio Max.</p>
                      <p className="font-medium">{stat.highestPrice.toFixed(2)} monedas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Categorías Destacadas */}
          {topCategory() && mostExpensiveCategory() && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-200/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md">Categoría más Popular</CardTitle>
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <CardDescription>Mayor número de productos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">{topCategory()?.categoryName}</h3>
                      <p className="text-sm text-muted-foreground">{topCategory()?.totalProducts} productos</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-300/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-blue-200/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md">Categoría más Cara</CardTitle>
                    <TrendingUp className="h-5 w-5 text-amber-400" />
                  </div>
                  <CardDescription>Mayor precio promedio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">{mostExpensiveCategory()?.categoryName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {mostExpensiveCategory()?.avgPrice.toFixed(2)} monedas (promedio)
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-300/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

