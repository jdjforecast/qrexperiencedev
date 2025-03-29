"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Registrar los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension: number
  }[]
}

interface HeavyChartProps {
  data: ChartData
}

export default function HeavyChart({ data }: HeavyChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Mi Gráfico",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  // Si no hay datos, mostrar un mensaje
  if (!data || !data.datasets || data.datasets.length === 0) {
    return <div>No hay datos disponibles para mostrar</div>
  }

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Line options={options} data={data} />
    </div>
  )
}

