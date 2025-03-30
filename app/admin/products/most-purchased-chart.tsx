"use client"

import { useState, useEffect } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Tipar la estructura esperada de la API
interface ChartApiResponse {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
  }>
}

export function MostPurchasedChart() {
  const [chartData, setChartData] = useState<ChartApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/chart-data")
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }
        const data: ChartApiResponse = await response.json()
        setChartData(data)
      } catch (err) {
        console.error("Error fetching chart data:", err)
        setError(err instanceof Error ? err.message : "Failed to load chart data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Top 10 Productos Más Comprados (Cantidad Total)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Cantidad Comprada",
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Populares</CardTitle>
        <CardDescription>Top 10 productos por cantidad total comprada.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        )}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!isLoading && !error && chartData && chartData.labels.length > 0 && <Bar options={options} data={chartData} />}
        {!isLoading && !error && (!chartData || chartData.labels.length === 0) && (
          <p className="text-center text-muted-foreground">
            No hay suficientes datos de pedidos para mostrar el gráfico.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

