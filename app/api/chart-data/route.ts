import { NextResponse } from "next/server"
import { createServerClient, isUserAdmin } from "@/lib/auth/server"

// Define a simple type for the chart data structure
interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    tension?: number;
  }>;
}

export async function GET() {
  try {
    // 1. Authentication & Authorization
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting Supabase session:", sessionError)
      return NextResponse.json({ error: "Error checking authentication" }, { status: 500 })
    }
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Fetch Order Items Data (Including Product Name)
    // Adjust the select query based on your actual table/column names
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        quantity,
        products ( name )
      `)
      // Optionally filter by order status, date range, etc.
      // .eq("orders.status", "completed")

    if (itemsError) {
      console.error("Error fetching order items:", itemsError)
      return NextResponse.json({ error: "Failed to fetch order data" }, { status: 500 })
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ labels: [], datasets: [] }) // Return empty chart data if no orders
    }

    // 3. Process Data: Count purchases per product
    const productCounts: Record<string, number> = {}

    orderItems.forEach((item) => {
      // Type assertion needed because Supabase relationships can be complex
      // Adjust to handle potential array return from join
      const productInfo = (item.products as Array<{ name: string }> | null)?.[0];
      const productName = productInfo?.name || "Producto Desconocido";
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;

      if (productName) {
        productCounts[productName] = (productCounts[productName] || 0) + quantity
      }
    });

    // 4. Format for Chart: Sort by count, take top N (e.g., top 10)
    const sortedProducts = Object.entries(productCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 10); // Get top 10 most purchased

    const labels = sortedProducts.map(([name]) => name);
    const data = sortedProducts.map(([, count]) => count);

    // Example color generation (you might want a more robust solution)
    const backgroundColors = labels.map((_, i) => `hsl(${(i * 360 / labels.length) % 360}, 70%, 70%)`);
    const borderColors = labels.map((_, i) => `hsl(${(i * 360 / labels.length) % 360}, 70%, 50%)`);


    const chartData: ChartData = {
      labels,
      datasets: [
        {
          label: "Productos Más Comprados (Cantidad Total)",
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
        },
      ],
    }

    return NextResponse.json(chartData)

  } catch (error) {
    console.error("Error processing chart data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

