import { z } from 'zod';
// Import the canonical Product type if needed for reference, but Zod defines the structure
// import { Product } from './product';

// Schema for Product (used for fetching/displaying, based on types/product.ts)
// Renamed from ProductDataSchema
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1), 
  description: z.string().nullish(), // Allow null or undefined
  price: z.number().positive(), 
  category: z.string().nullish(), // Allow null or undefined
  image_url: z.string().url().nullish(), // Allow null or undefined
  stock: z.number().int().min(0), 
  max_per_user: z.number().int().positive(), // Required, positive
  sku: z.string().nullish(), // Allow null or undefined
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }).nullish(), // Allow null or undefined
  urlpage: z.string().nullish(), // Allow null or undefined (from product-service usage)
});

// Schema for creating a new product (subset of Product)
// Based on fields required by DB and createProduct function
export const NewProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  max_per_user: z.number().int().positive(), // Required by createProduct type
  // Optional fields during creation:
  description: z.string().optional(),
  category: z.string().optional(),
  image_url: z.string().url().optional().nullable(), // Allow explicit null
  sku: z.string().optional(),
});

// Corresponds to OrderItem in types/order.ts
export const OrderItemSchema = z.object({
  quantity: z.number().int().positive(),
  price: z.number(), // Price at the time of order
  // Use the canonical ProductSchema now
  products: ProductSchema.nullable(), 
});

// Base Order Schema (Corresponds to Order in types/order.ts)
export const OrderSchema = z.object({
  order_id: z.string().uuid(),
  created_at: z.string().datetime({ offset: true }), // Expect ISO 8601 with timezone
  status: z.string(), // Consider using z.enum(['pending', 'completed', ...]) if applicable
  total_amount: z.number(),
  order_items: z.array(OrderItemSchema),
});

// Extended Schema for Admin View (Corresponds to AdminOrder in types/order.ts)
export const AdminOrderSchema = OrderSchema.extend({
  user: z.object({
    email: z.string().email().nullable(),
    full_name: z.string().nullable(),
  }).nullable(), // User object might be null
});

// Schema for the array returned by getAllOrders (using AdminOrderSchema)
export const AdminOrdersArraySchema = z.array(AdminOrderSchema);

// Schema for the array returned by getUserOrders (using OrderSchema)
export const OrdersArraySchema = z.array(OrderSchema);

// Schema for the expected return from the handle_new_order RPC call
export const CreateOrderRpcResultSchema = z.object({
  order_id: z.string().uuid(),
});

// Esquema básico para datos de productos
export const ProductDataSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  price: z.number().positive("El precio debe ser mayor que 0"),
  image_url: z.string().nullable().optional(),
  stock: z.number().int().nonnegative().default(0),
  code: z.string().min(3).optional(),
  urlpage: z.string().optional(),
});

// Re-exportar el tipo
export type ProductData = z.infer<typeof ProductDataSchema>; 