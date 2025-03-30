import { notFound } from "next/navigation"
import { Metadata } from "next"
import { createServerClientForApi } from "@/lib/supabase/server-api"
import ProductDetailsClient from "./product-details-client"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock: number
  code: string
  short_code: string
}

interface ProductPageProps {
  params: { code: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const code = params.code
  console.log(`[ProductPage Server] Received short_code param: "${code}"`);

  const supabase = createServerClientForApi()

  console.log(`[ProductPage Server] Attempting to fetch product with short_code: "${code}"`);

  let product: Product | null = null;
  let fetchError: any = null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq('short_code', code)
      .single<Product>()
    
    product = data;
    fetchError = error;

  } catch (caughtError) {
    console.error("[ProductPage Server] Exception caught during Supabase fetch:", caughtError);
    fetchError = caughtError;
  }

  if (fetchError) {
    console.error("[ProductPage Server] Supabase fetch error object:", JSON.stringify(fetchError, null, 2));
    notFound()
  }

  if (!product) {
    console.warn(`[ProductPage Server] Product not found in DB for short_code: "${code}"`);
    notFound()
  }

  console.log(`[ProductPage Server] Product found: ${product.name} (ID: ${product.id}, short_code: ${product.short_code}). Rendering client component.`);

  return (
    <div className="container mx-auto p-4">
      <ProductDetailsClient product={product} />
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const code = params.code
  const supabase = createServerClientForApi()

  const { data: product } = await supabase
    .from("products")
    .select("name, description, short_code")
    .eq('short_code', code)
    .single<Pick<Product, "name" | "description" | "short_code">>()

  if (!product) {
    return {
      title: "Producto no encontrado",
    }
  }

  return {
    title: product.name,
    description: product.description || "Sin descripción disponible",
  }
}

