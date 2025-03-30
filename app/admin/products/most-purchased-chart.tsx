"use client"

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBrowserClient } from '@/lib/supabase-client-browser';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface ChartData {
  productName: string;
  totalQuantity: number;
}

export default function MostPurchasedChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMostPurchased = async () => {
      setLoading(true);
      setError(null);
      const supabase = getBrowserClient();

      try {
        // --- AJUSTA ESTA CONSULTA A TU ESQUEMA ---
        // Asume tabla 'order_items' con 'product_id', 'quantity'
        // Asume tabla 'products' con 'id', 'name'
        const { data, error: queryError } = await supabase
          .from('order_items') // <- Ajusta el nombre de la tabla si es necesario
          .select(`
            quantity,
            products ( name ) 
          `) // <- Ajusta nombres de columna/tabla si es necesario
          .limit(500); // Limita por rendimiento, agrega paginación si es necesario

        if (queryError) {
          throw queryError;
        }

        if (!data) {
          setChartData([]);
          return;
        }

        // Procesar datos para agregar cantidades por producto
        const productQuantities: { [key: string]: number } = {};
        data.forEach((item: any) => {
            // Asegúrate que el producto y nombre existen
            const productName = item.products?.name;
            const quantity = item.quantity;

            if (productName && typeof quantity === 'number') {
                productQuantities[productName] = (productQuantities[productName] || 0) + quantity;
            }
        });

        // Convertir a formato de gráfico y ordenar
        const formattedData = Object.entries(productQuantities)
          .map(([productName, totalQuantity]) => ({ productName, totalQuantity }))
          .sort((a, b) => b.totalQuantity - a.totalQuantity)
          .slice(0, 10); // Tomar los 10 productos más vendidos

        setChartData(formattedData);
        // --- FIN DE AJUSTE DE CONSULTA ---

      } catch (err: any) {
        console.error('Error fetching most purchased products:', err);
        setError('No se pudieron cargar los datos del gráfico.');
      } finally {
        setLoading(false);
      }
    };

    fetchMostPurchased();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Populares</CardTitle>
          <CardDescription>Top 10 productos por cantidad total comprada.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Populares</CardTitle>
          <CardDescription>Top 10 productos por cantidad total comprada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Populares</CardTitle>
          <CardDescription>Top 10 productos por cantidad total comprada.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No hay suficientes datos de pedidos para mostrar el gráfico.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Populares</CardTitle>
        <CardDescription>Top 10 productos por cantidad total comprada.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="productName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalQuantity" fill="#8884d8" name="Cantidad Vendida" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

