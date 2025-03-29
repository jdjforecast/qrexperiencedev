import { NextResponse } from "next/server"

export async function GET() {
  // Simular un retraso para imitar una llamada a la API real
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Devolver datos de ejemplo para el gráfico
  return NextResponse.json({
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        label: "Ventas 2024",
        data: [12, 19, 3, 5, 2, 3],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
      {
        label: "Ventas 2023",
        data: [8, 12, 6, 9, 4, 7],
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.1,
      },
    ],
  })
}

