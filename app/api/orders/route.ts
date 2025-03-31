import { NextResponse } from "next/server"
import { createServerClient, isUserAdmin } from "@/lib/auth/server" // Usar helpers de auth
import { AdminOrdersArraySchema } from "@/types/schemas" // Importar schema Zod
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    // 1. Autenticación y Autorización
    const supabase = await createServerClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("API GET /api/orders: Error getting Supabase session:", sessionError)
      return NextResponse.json({ error: "Error checking authentication" }, { status: 500 })
    }
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const isAdmin = await isUserAdmin(session.user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Obtener datos de pedidos (consulta adaptada de lib/admin.ts)
    const { data, error } = await supabase
      .from("orders")
      .select(`
        order_id,
        created_at,
        status,
        total_amount,
        user:user_id(email, full_name),
        order_items (
          quantity,
          price,
          products ( // Corregir referencia a tabla products
            id, 
            name,
            price,
            image_url,
            stock
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("API GET /api/orders: Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // 3. Validar datos con Zod
    const validationResult = AdminOrdersArraySchema.safeParse(data)
    if (!validationResult.success) {
      console.error("API GET /api/orders: Zod validation failed:", validationResult.error.errors)
      // Es un error del servidor si los datos de la DB no coinciden con el schema
      return NextResponse.json({ error: "Invalid order data received from database." }, { status: 500 })
    }

    // 4. Devolver datos validados
    return NextResponse.json(validationResult.data)
  } catch (error) {
    console.error("API GET /api/orders: Unexpected error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Define la estructura esperada del cuerpo de la solicitud
interface OrderRequestBody {
  customerInfo: {
    fullName: string;
    companyName: string;
    email: string;
    phone?: string;
  };
  items: {
    productId: string;
    quantity: number;
    price: number; // Incluir precio unitario desde el carrito
  }[];
  totalPrice: number;
}

// Crear cliente Supabase para el servidor usando Service Role Key
// ¡ASEGÚRATE de que estas variables de entorno estén configuradas en Vercel!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Missing Supabase URL or Service Role Key environment variables.');
  // Podríamos lanzar un error aquí para detener el inicio si faltan
}

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequestBody = await request.json();

    // --- Validación de Datos --- 
    if (!body.customerInfo || !body.items || body.items.length === 0 || !body.totalPrice) {
      return NextResponse.json({ success: false, message: 'Datos de orden incompletos.' }, { status: 400 });
    }
    if (!body.customerInfo.fullName || !body.customerInfo.companyName || !body.customerInfo.email) {
        return NextResponse.json({ success: false, message: 'Nombre completo, empresa y email son requeridos.' }, { status: 400 });
    }

    // --- Lógica de Base de Datos (Secuencial - Mejor con DB Function) --- 
    // **ADVERTENCIA:** Esta lógica secuencial no es atómica. Si falla a mitad
    // de camino (ej. al actualizar stock), la orden podría quedar inconsistente.
    // Se recomienda encarecidamente usar una Función de Base de Datos Supabase (PLpgSQL)
    // que maneje la creación de la orden y la actualización del stock en una única transacción.

    // 1. (Opcional pero recomendado) Verificar stock antes de insertar
    //    Esto requeriría leer el stock actual de todos los productIds

    // 2. Insertar la orden principal
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders') // Supone tabla 'orders'
      .insert({
        full_name: body.customerInfo.fullName,
        company_name: body.customerInfo.companyName,
        email: body.customerInfo.email,
        phone: body.customerInfo.phone,
        total_price: body.totalPrice,
        status: 'pending', // Estado inicial
        // user_id: null, // No hay usuario autenticado
      })
      .select('id') // Devolver el ID de la nueva orden
      .single(); // Esperamos un solo resultado

    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      throw new Error('No se pudo crear la orden principal.');
    }

    const newOrderId = orderData.id;

    // 3. Insertar los items de la orden
    const orderItemsToInsert = body.items.map(item => ({
      order_id: newOrderId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.price, // Usar el precio unitario del carrito
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items') // Supone tabla 'order_items'
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // **IMPORTANTE:** En este punto, la orden principal se creó, pero los items no.
      // Deberíamos intentar eliminar la orden principal para mantener la consistencia.
      // Esto es complejo y por eso una DB Function es mejor.
      await supabaseAdmin.from('orders').delete().match({ id: newOrderId });
      throw new Error('No se pudo guardar los detalles de la orden.');
    }

    // 4. Actualizar Stock (¡La parte más crítica para hacerla atómica!)
    //    Iterar sobre cada item y decrementar el stock.
    //    Nuevamente, una DB Function haría esto de forma más segura.
    for (const item of body.items) {
      const { error: stockError } = await supabaseAdmin.rpc('decrement_product_stock', {
          p_product_id: item.productId,
          p_quantity: item.quantity
      });
        
      // Si existe una función `decrement_product_stock` que maneja la resta
      // de forma segura (ej. chequeando que no quede negativo).

      // Alternativa si no hay rpc (MENOS SEGURA):
      /*
      const { data: productData, error: productReadError } = await supabaseAdmin
        .from('products')
        .select('stock_quantity')
        .eq('id', item.productId)
        .single();

      if (productReadError || !productData) throw new Error(`Error al leer stock para ${item.productId}`);
      if (productData.stock_quantity < item.quantity) throw new Error(`Stock insuficiente para ${item.productId}`);

      const newStock = productData.stock_quantity - item.quantity;
      const { error: stockUpdateError } = await supabaseAdmin
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.productId);
        
      if (stockUpdateError) throw new Error(`Error al actualizar stock para ${item.productId}`);
      */

      if (stockError) {
          console.error(`Error decrementing stock for product ${item.productId}:`, stockError);
          // **ROLLBACK COMPLICADO**: Aquí tendríamos que revertir la inserción de la orden
          // y los order_items, y potencialmente las actualizaciones de stock anteriores.
          // ¡DB FUNCTION ES LA SOLUCIÓN!
          // Por ahora, lanzamos un error general, pero la DB podría estar inconsistente.
          throw new Error('Error al actualizar el stock de productos.');
      }
    }

    // --- Éxito --- 
    return NextResponse.json({ success: true, orderId: newOrderId });

  } catch (error: any) {
    console.error('Error in /api/orders POST:', error);
    return NextResponse.json({ success: false, message: error.message || 'Error interno del servidor al procesar la orden.' }, { status: 500 });
  }
}

