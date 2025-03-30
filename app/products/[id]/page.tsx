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
}

interface ProductPageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const id = params.id
  // Log the received ID from the URL parameters
  console.log(`[ProductPage Server] Received ID param: "${id}"`); 

  const supabase = createServerClientForApi()

  console.log(`[ProductPage Server] Attempting to fetch product with urlpage OR id: "${id}"`);

  let product: Product | null = null;
  let fetchError: any = null; // Use 'any' to capture potential error object structure

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`urlpage.eq.${id},id.eq.${id}`)
      .single<Product>()
    
    product = data; // Assign data to product
    fetchError = error; // Assign error to fetchError

  } catch (caughtError) {
    // Catch unexpected errors during the Supabase call itself
    console.error("[ProductPage Server] Exception caught during Supabase fetch:", caughtError);
    fetchError = caughtError; // Store the caught error
  }

  // Log the result of the fetch attempt
  if (fetchError) {
    console.error("[ProductPage Server] Supabase fetch error object:", JSON.stringify(fetchError, null, 2));
    // Consider if specific error codes should be handled differently, but for now, any error leads to notFound
    notFound()
  }

  if (!product) {
    // This means the query ran without error, but no matching row was found
    console.warn(`[ProductPage Server] Product not found in DB for identifier: "${id}"`);
    notFound()
  }

  // Log success before rendering client component
  console.log(`[ProductPage Server] Product found: ${product.name} (ID: ${product.id}). Rendering client component.`);

  return (
    <div className="container mx-auto p-4">
      <ProductDetailsClient product={product} />
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const id = params.id
  const supabase = createServerClientForApi()
  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .or(`urlpage.eq.${id},id.eq.${id}`)
    .single<Pick<Product, "name" | "description">>()

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

