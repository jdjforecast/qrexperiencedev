// import { cookies } from "next/headers";
// import { createClient } from "@/lib/supabase/server"; // Re-import server client
import { createClientClient } from "@/lib/supabase/client"; // Import the client-side Supabase client
// import { clearCart } from "./cart"
import type { CartItem } from "@/types/cart"; // Import the standardized CartItem type
import { Order } from "@/types/order"; // Import the Order type
import {
  OrderSchema,
  OrdersArraySchema,
  CreateOrderRpcResultSchema
} from '@/types/schemas'; // Import Zod schemas

// Define a specific return type for order fetching functions
type OrderFetchResult = 
  | { success: true; data: Order }
  | { success: false; error: string };

// Define a similar type for multiple orders (if needed later, or for consistency)
type OrdersFetchResult = 
  | { success: true; data: Order[] }
  | { success: false; error: string };

// Define interface for shipping details
interface ShippingDetails {
    address: string;
    city: string;
    postalCode: string;
    phone: string;
}

// Refactored createOrder using RPC and Zod validation for result
export async function createOrder(userId: string, cartItems: CartItem[], total: number): Promise<{ success: boolean; data?: { order_id: string }; error?: string }> {
  const supabase = createClientClient();
  // Prepare cart items for JSONB argument, ensuring price is included
  const itemsPayload = cartItems.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
    // Use price from the first product in the array, default to 0 if missing
    price: item.products?.[0]?.price ?? 0 
  }));

  try {
    // Call the database function assumed to handle the transaction
    const { data, error } = await supabase.rpc('handle_new_order', {
      p_user_id: userId,
      p_cart_items: itemsPayload,
      p_total_amount: total
    });

    if (error) {
      console.error("Error calling handle_new_order RPC:", error);
      const userMessage = error.message.includes('Insufficient stock')
          ? 'Error: Stock insuficiente para uno de los productos.'
          : 'Error al procesar el pedido en la base de datos.';
      return { success: false, error: userMessage };
    }

    // Validate the structure of the RPC return data
    const validationResult = CreateOrderRpcResultSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Zod validation failed for createOrder RPC result:", validationResult.error.errors);
      return { success: false, error: "Error: Respuesta inválida desde la base de datos." };
    }

    // RPC call and validation successful
    return { success: true, data: validationResult.data };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error inesperado al llamar RPC createOrder";
    console.error("Unexpected error calling createOrder RPC:", error);
    return { success: false, error: errorMessage };
  }
}

// Refactored getUserOrders with Zod validation
export async function getUserOrders(userId: string): Promise<OrdersFetchResult> {
  const supabase = createClientClient(); 
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        order_id,
        created_at,
        status,
        total_amount, 
        order_items (
          quantity,
          price, 
          products ( 
            id:product_id, 
            name,
            price, 
            image_url,
            stock
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) { 
      console.error("Error fetching user orders:", error);
      return { success: false, error: error.message }; 
    }

    // Validate data with Zod instead of casting
    const validationResult = OrdersArraySchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Zod validation failed for getUserOrders:", validationResult.error.errors);
      return { success: false, error: "Error: Datos de pedidos inválidos recibidos." };
    }

    // Return validated data
    return { success: true, data: validationResult.data };

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error inesperado al obtener los pedidos";
    console.error("Unexpected error fetching user orders:", err);
    return { success: false, error: errorMessage };
  }
}

// Refactored getOrderById with Zod validation
export async function getOrderById(orderId: string): Promise<OrderFetchResult> {
  const supabase = createClientClient();
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        order_id, 
        created_at,
        status,
        total_amount, 
        order_items (
          quantity,
          price, 
          products ( 
            id:product_id, 
            name,
            price, 
            image_url,
            stock
          )
        )
      `)
      .eq("order_id", orderId)
      .single();

    if (error) { 
        console.error("Error al obtener el pedido:", error.message);
        if (error.code === 'PGRST116') { // Not found
          return { success: false, error: "Pedido no encontrado" };
        }
        return { success: false, error: error.message }; 
    }
    
    // Validate data with Zod instead of casting
    const validationResult = OrderSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Zod validation failed for getOrderById:", validationResult.error.errors);
      return { success: false, error: "Error: Datos de pedido inválidos recibidos." };
    }

    // Return validated data
    return { success: true, data: validationResult.data };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error inesperado al obtener el pedido";
    console.error("Error inesperado al obtener el pedido:", error);
    return { success: false, error: errorMessage };
  }
}

// Refined updateOrderStatus with Zod validation for returned data
export async function updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; data?: Order; error?: string }> {
  const supabase = createClientClient();
  try {
    const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("order_id", orderId)
        // Select necessary fields matching OrderSchema to validate the returned object
        .select(`
          order_id, 
          created_at,
          status,
          total_amount, 
          order_items (
            quantity,
            price, 
            products ( 
              id:product_id, 
              name,
              price, 
              image_url,
              stock
            )
          )
        `)
        .single()

    if (error) { 
        console.error("Error updating order status:", error);
        return { success: false, error: "Error al actualizar el estado del pedido" } 
    }

    // Validate the returned updated order
    const validationResult = OrderSchema.safeParse(data);
    if (!validationResult.success) {
        console.error("Zod validation failed for updateOrderStatus return:", validationResult.error.errors);
        // Return success=false as the update happened but return data is wrong
        return { success: false, error: "Error: Respuesta inválida después de actualizar." };
    }

    return { success: true, data: validationResult.data } 

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error inesperado al actualizar el estado del pedido";
    console.error("Error inesperado al actualizar el estado del pedido:", error)
    return { success: false, error: errorMessage }
  }
}

