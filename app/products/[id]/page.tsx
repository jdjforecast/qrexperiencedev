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
  short_code: string | null
  urlpage?: string | null
}

interface ProductPageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const urlpageSlug = params.id
  console.log(`[ProductPage Server] Received urlpageSlug param: "${urlpageSlug}"`);

  if (!urlpageSlug || urlpageSlug.trim() === "") {
    console.warn(`[ProductPage Server] Received empty or invalid urlpageSlug.`);
    notFound();
  }

  const supabase = createServerClientForApi()

  console.log(`[ProductPage Server] Attempting to fetch product with urlpage: "${urlpageSlug}"`);

  let product: Product | null = null;
  let fetchError: any = null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq('urlpage', urlpageSlug)
      .single<Product>()
    
    product = data;
    fetchError = error;

  } catch (caughtError) {
    console.error("[ProductPage Server] Exception caught during Supabase fetch:", caughtError);
    fetchError = caughtError;
  }

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
         console.warn(`[ProductPage Server] Product not found in DB for urlpage: "${urlpageSlug}" (PGRST116)`);
    } else {
        console.error("[ProductPage Server] Supabase fetch error object:", JSON.stringify(fetchError, null, 2));
    }
    notFound()
  }

  if (!product) {
    console.warn(`[ProductPage Server] Product query succeeded but returned null/undefined for urlpage: "${urlpageSlug}"`);
    notFound()
  }

  console.log(`[ProductPage Server] Product found: ${product.name} (ID: ${product.id}, urlpage: ${product.urlpage}). Rendering client component.`);

  return (
    <div className="container mx-auto p-4">
      <ProductDetailsClient product={product} />
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const urlpageSlug = params.id
  if (!urlpageSlug || urlpageSlug.trim() === "") {
    return { title: "Identificador de Producto Inválido" };
  }
  
  const supabase = createServerClientForApi()

  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, urlpage")
    .eq('urlpage', urlpageSlug)
    .single<Pick<Product, "id" | "name" | "description" | "urlpage">>()

  if (!product) {
    return {
      title: "Producto no encontrado",
    }
  }

  const canonicalPath = product.urlpage;

  return {
    title: product.name,
    description: product.description || "Sin descripción disponible",
    alternates: {
      canonical: canonicalPath ? `/products/${canonicalPath}` : undefined,
    },
  }
}

