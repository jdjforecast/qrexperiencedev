"use client"

import { useState, useEffect, useCallback, useRef } from "react"

/**
 * Opciones para el hook useDataLoader
 */
interface UseDataLoaderOptions<T> {
  /** Función para cargar los datos */
  fetcher: () => Promise<T>
  /** Datos iniciales */
  initialData?: T | null
  /** Clave para guardar en caché */
  cacheKey?: string
  /** Duración de la caché en milisegundos */
  cacheDuration?: number
  /** Si debe realizar la carga al inicio */
  enabled?: boolean
  /** Número de reintentos en caso de error */
  retryCount?: number
  /** Retraso entre reintentos en milisegundos */
  retryDelay?: number
  /** Tiempo de espera máximo para la petición en milisegundos */
  timeout?: number
  /** Si debe evitar la caché */
  skipCache?: boolean
  /** Callback cuando los datos se cargan exitosamente */
  onSuccess?: (data: T) => void
  /** Callback cuando hay un error */
  onError?: (error: Error) => void
}

/**
 * Resultado del hook useDataLoader
 */
interface UseDataLoaderResult<T> {
  /** Datos cargados */
  data: T | null
  /** Si está cargando datos */
  isLoading: boolean
  /** Error durante la carga */
  error: Error | null
  /** Función para recargar los datos */
  refetch: () => Promise<void>
  /** Función para forzar los datos a un valor */
  setData: (data: T | null) => void
  /** Si los datos provienen de la caché */
  isFromCache: boolean
  /** Si los datos fueron cargados exitosamente al menos una vez */
  isSuccess: boolean
  /** Si hubo un error al cargar los datos */
  isError: boolean
  /** Fecha de la última vez que se cargaron los datos */
  lastUpdated: Date | null
  /** Aborta la petición actual */
  abort: () => void
}

/**
 * Hook personalizado para cargar datos con soporte de caché, recarga y reintentos
 * @param options Opciones para la carga de datos
 * @returns Estado y funciones para gestionar los datos
 */
export function useDataLoader<T>({
  fetcher,
  initialData = null as T | null,
  cacheKey,
  cacheDuration = 5 * 60 * 1000, // 5 minutos por defecto
  enabled = true,
  retryCount = 3,
  retryDelay = 1000,
  timeout = 30000,
  skipCache = false,
  onSuccess,
  onError,
}: UseDataLoaderOptions<T>): UseDataLoaderResult<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [isLoading, setIsLoading] = useState<boolean>(enabled)
  const [error, setError] = useState<Error | null>(null)
  const [isFromCache, setIsFromCache] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isServerSide = typeof window === "undefined"
  const retryCountRef = useRef<number>(0)

  // Estado derivado
  const isSuccess = data !== null && error === null
  const isError = error !== null

  /**
   * Obtiene datos de la caché
   */
  const getCachedData = useCallback((): [T | null, boolean, Date | null] => {
    if (!cacheKey || isServerSide || skipCache) return [null, false, null]

    try {
      const cachedItem = localStorage.getItem(`data_cache_${cacheKey}`)
      if (!cachedItem) return [null, false, null]

      const { data, expiry, timestamp } = JSON.parse(cachedItem)
      const isValid = expiry && new Date().getTime() < expiry
      const lastUpdate = timestamp ? new Date(timestamp) : null

      return isValid ? [data, true, lastUpdate] : [null, false, null]
    } catch (e) {
      console.warn(`[useDataLoader] Error retrieving cached data for ${cacheKey}:`, e)
      return [null, false, null]
    }
  }, [cacheKey, isServerSide, skipCache])

  /**
   * Guarda datos en la caché
   */
  const setCachedData = useCallback(
    (data: T) => {
      if (!cacheKey || isServerSide) return

      try {
        const now = new Date()
        const expiry = now.getTime() + cacheDuration
        localStorage.setItem(
          `data_cache_${cacheKey}`,
          JSON.stringify({
            data,
            expiry,
            timestamp: now.toISOString(),
          }),
        )
      } catch (e) {
        console.warn(`[useDataLoader] Error caching data for ${cacheKey}:`, e)
      }
    },
    [cacheKey, cacheDuration, isServerSide],
  )

  /**
   * Carga los datos con soporte para reintentos y timeout
   */
  const loadData = useCallback(
    async (force = false): Promise<void> => {
      if (isServerSide) return

      // Abortar cualquier petición anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Crear nuevo controlador para esta petición
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setIsLoading(true)

      try {
        // Intentar obtener datos de caché si no es forzado
        if (cacheKey && !force && !skipCache) {
          const [cachedData, isValid, lastUpdate] = getCachedData()
          if (cachedData && isValid) {
            setData(cachedData)
            setIsFromCache(true)
            setIsLoading(false)
            setLastUpdated(lastUpdate)
            onSuccess?.(cachedData)
            return
          }
        }

        // Configurar timeout
        const timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort()
          }
        }, timeout)

        // Si no hay caché o está expirado, cargar datos frescos
        const fetchWithSignal = async (): Promise<T> => {
          // Hack: envolver la función fetcher para pasarle señal de aborto
          // sin modificar la API del hook
          return new Promise(async (resolve, reject) => {
            try {
              // Verificar si ya fue abortado
              if (signal.aborted) {
                reject(new Error("Aborted"))
                return
              }

              // Listener para abortar
              const abortListener = () => {
                reject(new Error("Request aborted"))
              }

              signal.addEventListener("abort", abortListener)

              try {
                const result = await fetcher()
                resolve(result)
              } catch (error) {
                reject(error)
              } finally {
                signal.removeEventListener("abort", abortListener)
              }
            } catch (error) {
              reject(error)
            }
          })
        }

        try {
          const freshData = await fetchWithSignal()

          // Limpiar timeout
          clearTimeout(timeoutId)

          // Si fue abortado durante el fetch, no actualizar estado
          if (signal.aborted) return

          // Resetear conteo de reintentos
          retryCountRef.current = 0

          // Actualizar estados
          setData(freshData)
          setIsFromCache(false)
          setError(null)
          const now = new Date()
          setLastUpdated(now)

          // Guardar en caché si se configuró una clave
          if (cacheKey) {
            setCachedData(freshData)
          }

          // Llamar al callback de éxito
          onSuccess?.(freshData)
        } catch (error) {
          // Limpiar timeout
          clearTimeout(timeoutId)

          // Si fue abortado, no hacer nada más
          if (signal?.aborted) return

          const errorInstance = error instanceof Error ? error : new Error(String(error))

          // Intentar de nuevo si no hemos superado el número de reintentos
          if (retryCountRef.current < retryCount) {
            retryCountRef.current++
            console.warn(`[useDataLoader] Retry ${retryCountRef.current}/${retryCount} after error:`, error)

            // Esperar antes de reintentar
            setTimeout(() => {
              loadData(force)
            }, retryDelay * retryCountRef.current) // Retraso progresivo

            return
          }

          // Si hemos agotado los reintentos, mostrar el error
          console.error("[useDataLoader] Error loading data after max retries:", error)
          setError(errorInstance)

          // Llamar al callback de error
          onError?.(errorInstance)
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false)
        }
      }
    },
    [
      fetcher,
      cacheKey,
      getCachedData,
      setCachedData,
      retryCount,
      retryDelay,
      timeout,
      skipCache,
      onSuccess,
      onError,
      isServerSide,
    ],
  )

  /**
   * Función expuesta para recargar datos manualmente forzando llamada
   */
  const refetch = useCallback(async () => {
    retryCountRef.current = 0
    await loadData(true)
  }, [loadData])

  /**
   * Exponer una función para abortar la petición actual
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }, [])

  /**
   * Cargar datos al inicio si enabled=true
   */
  useEffect(() => {
    if (enabled && !isServerSide) {
      loadData()
    }

    return () => {
      // Abortar cualquier petición pendiente al desmontar
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [enabled, loadData, isServerSide])

  return {
    data,
    isLoading,
    error,
    refetch,
    setData,
    isFromCache,
    isSuccess,
    isError,
    lastUpdated,
    abort,
  }
}

