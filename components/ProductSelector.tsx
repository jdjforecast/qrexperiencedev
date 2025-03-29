"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useDataLoader } from "@/hooks/use-data-loader"
import { getProducts } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LoaderIcon, CheckIcon, ChevronDownIcon, XCircleIcon, AlertTriangleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

/**
 * Interfaz para los productos
 */
interface Product {
  id: string
  name: string
  price: number
  category?: string
  image_url?: string
  sku?: string
}

/**
 * Props para el componente ProductSelector
 */
interface ProductSelectorProps {
  /** Función que se llama cuando se selecciona un producto */
  onSelect: (product: Product | null) => void
  /** Valor inicial seleccionado */
  initialValue?: string
  /** Categoría para filtrar productos */
  category?: string
  /** Placeholder para el campo de búsqueda */
  placeholder?: string
  /** Clase personalizada */
  className?: string
  /** Clase para el botón */
  buttonClassName?: string
  /** Si debe mostrar precios */
  showPrices?: boolean
  /** Si debe mostrar categorías */
  showCategories?: boolean
  /** Si está deshabilitado */
  disabled?: boolean
}

/**
 * Componente para seleccionar productos con búsqueda autocompletada
 * y caché para mejorar el rendimiento
 */
export function ProductSelector({
  onSelect,
  initialValue,
  category,
  placeholder = "Seleccionar producto...",
  className,
  buttonClassName,
  showPrices = true,
  showCategories = true,
  disabled = false,
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(initialValue)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Referencias para mejorar rendimiento
  const allProductsRef = useRef<Product[]>([])

  // Función para cargar productos con filtrado opcional por categoría
  const fetchProducts = useCallback(async () => {
    const { data } = await getProducts()
    if (!data) return []

    // Si hay una categoría especificada, filtramos por esa categoría
    if (category) {
      return data.filter((product: Product) => product.category === category)
    }

    return data
  }, [category])

  // Callbacks para eventos del hook
  const handleProductsSuccess = useCallback(
    (data: Product[]) => {
      // Guardamos todos los productos en la referencia
      allProductsRef.current = data

      // Si hay un producto inicialmente seleccionado, lo buscamos
      if (initialValue && !selectedProduct) {
        const product = data.find((p) => p.id === initialValue)
        if (product) {
          setSelectedProduct(product)
        }
      }
    },
    [initialValue, selectedProduct],
  )

  const handleProductsError = useCallback((error: Error) => {
    toast({
      title: "Error al cargar productos",
      description: "No se pudieron cargar los productos para seleccionar",
      variant: "destructive",
    })
  }, [])

  // Usar el hook mejorado para cargar los productos con caché
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
    isFromCache,
  } = useDataLoader({
    fetcher: fetchProducts,
    cacheKey: `product-selector-${category || "all"}`,
    cacheDuration: 10 * 60 * 1000, // 10 minutos,
    retryCount: 2,
    onSuccess: handleProductsSuccess,
    onError: handleProductsError,
  })

  // Actualizar el producto seleccionado cuando cambia el ID
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p) => p.id === selectedProductId)
      if (product) {
        setSelectedProduct(product)
        onSelect(product)
      }
    } else {
      setSelectedProduct(null)
      onSelect(null)
    }
  }, [selectedProductId, products, onSelect])

  // Manejar la selección de un producto
  const handleSelect = useCallback((productId: string) => {
    setSelectedProductId(productId)
    setOpen(false)
  }, [])

  // Limpiar la selección
  const clearSelection = useCallback(() => {
    setSelectedProductId(undefined)
    setSelectedProduct(null)
    onSelect(null)
  }, [onSelect])

  // Formatear precio con separador de miles
  const formatPrice = useCallback((price: number) => {
    return price.toLocaleString("es-ES")
  }, [])

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between relative px-3",
              buttonClassName,
              selectedProduct ? "text-left font-normal" : "",
              disabled ? "opacity-50 cursor-not-allowed" : "",
            )}
            disabled={disabled}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoaderIcon className="h-4 w-4 animate-spin" />
                Cargando...
              </span>
            ) : selectedProduct ? (
              <div className="flex items-center gap-2 truncate max-w-full">
                <span className="truncate max-w-[80%]">{selectedProduct.name}</span>
                {showPrices && (
                  <Badge variant="secondary" className="ml-auto whitespace-nowrap">
                    {formatPrice(selectedProduct.price)} monedas
                  </Badge>
                )}
              </div>
            ) : (
              placeholder
            )}
            <div className="flex ml-auto pl-1">
              {selectedProduct && (
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearSelection()
                  }}
                  className="h-4 w-4 p-0 mr-1"
                  disabled={disabled}
                  aria-label="Limpiar selección"
                >
                  <XCircleIcon className="h-4 w-4" />
                </Button>
              )}
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar producto..." />

            {error && (
              <div className="p-2 text-sm text-red-500 flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4" />
                <span>Error al cargar productos</span>
                <Button size="sm" variant="outline" className="ml-auto text-xs h-7" onClick={refetch}>
                  Reintentar
                </Button>
              </div>
            )}

            {isFromCache && <div className="px-2 py-1 text-xs text-muted-foreground">Usando datos en caché</div>}

            <CommandEmpty>No se encontraron productos</CommandEmpty>
            <CommandList>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-6 gap-2">
                  <LoaderIcon className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Cargando productos...</p>
                </div>
              ) : (
                <CommandGroup>
                  {products.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={`${product.id}-${product.name}-${product.category || ""}`}
                      onSelect={() => handleSelect(product.id)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        {showCategories && product.category && (
                          <span className="text-xs text-muted-foreground">{product.category}</span>
                        )}
                      </div>
                      <div className="flex items-center">
                        {showPrices && (
                          <Badge variant="outline" className="mr-2">
                            {formatPrice(product.price)}
                          </Badge>
                        )}
                        {selectedProductId === product.id && <CheckIcon className="h-4 w-4 text-green-500" />}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

