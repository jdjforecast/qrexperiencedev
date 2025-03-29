"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, isUserAdmin } from "@/lib/auth"
import { uploadProductImage } from "@/lib/storage/products"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/types/product"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isUserAdminState, setIsUserAdminState] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    max_per_user: 0,
    sku: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const productId = params.id

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await getCurrentUser()
      if (user) {
        setUserId(user.id)

        // Check if user is admin
        const admin = await isUserAdmin(user.id)
        setIsUserAdminState(admin)

        if (admin) {
          // Load product data
          loadProduct()
        } else {
          // Redirect to home if not admin
          router.push("/")
        }
      } else {
        // Redirect to login if not logged in
        router.push("/login")
      }
    }

    checkAdmin()
  }, [router, productId])

  const loadProduct = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${productId}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: Product = await response.json()

      setProduct(data)
      setFormData({
        name: data.name || "",
        description: data.description || "",
        price: data.price || 0,
        category: data.category || "",
        stock: data.stock || 0,
        max_per_user: data.max_per_user || 0,
        sku: data.sku || "",
      })
      setImagePreview(data.image_url || null)
    } catch (error) {
      console.error("Error loading product via API:", error)
      const message = error instanceof Error ? error.message : "Error al cargar el producto"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)

    // Crear preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Si el campo es numérico, convertir a número
    if (name === "price" || name === "stock" || name === "max_per_user") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // 1. Use fetch PUT instead of updateProduct
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send current form data
      });

      // 2. Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Product data updated successfully via API.
      // Now, upload the new image if one was selected.
      let uploadSuccessful = true; // Assume success if no image file
      if (imageFile) { // 3. Image upload logic remains
        const { error: uploadError } = await uploadProductImage(imageFile, productId);
        if (uploadError) {
          uploadSuccessful = false;
          console.error("Error uploading new image:", uploadError);
          toast({
            title: "Advertencia",
            description: "Datos del producto actualizados, pero falló la subida de la nueva imagen.",
            variant: "default", // Or use a specific warning variant
          });
          // Decide whether to proceed with redirect even if image fails
          // Proceeding for now.
        }
      }

      // Show full success toast only if data update succeeded AND
      // (there was no new image OR the new image upload also succeeded)
      if (uploadSuccessful) {
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente.",
          variant: "default",
        });
      }

      router.push("/admin/products"); // Redirect after operations

    } catch (error) { // Handle errors (from PUT or image upload)
      console.error("Error updating product process:", error);
      const message = error instanceof Error ? error.message : "Error al actualizar el producto";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar Producto</h1>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-6">{error}</div>}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : product ? (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nombre del producto *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-white/10 backdrop-blur-md border border-white/20"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Descripción
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-white/10 backdrop-blur-md border border-white/20 min-h-[100px]"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Categoría
                </label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="bg-white/10 backdrop-blur-md border border-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-2">
                    Precio (monedas) *
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="bg-white/10 backdrop-blur-md border border-white/20"
                  />
                </div>

                <div>
                  <label htmlFor="sku" className="block text-sm font-medium mb-2">
                    SKU
                  </label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="bg-white/10 backdrop-blur-md border border-white/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium mb-2">
                    Stock disponible
                  </label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="bg-white/10 backdrop-blur-md border border-white/20"
                  />
                </div>

                <div>
                  <label htmlFor="max_per_user" className="block text-sm font-medium mb-2">
                    Máx. por usuario
                  </label>
                  <Input
                    id="max_per_user"
                    name="max_per_user"
                    type="number"
                    min="0"
                    value={formData.max_per_user}
                    onChange={handleInputChange}
                    className="bg-white/10 backdrop-blur-md border border-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Imagen del producto</label>

                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt={formData.name}
                        width={128}
                        height={128}
                        className="object-contain"
                      />
                    ) : (
                      <div className="text-center text-white/50 px-2">
                        <p className="text-xs">Sin imagen</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="relative">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full mb-2"
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Subir imagen
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-blue-200">Formatos: JPG, PNG. Max: 1MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
              onClick={() => router.push("/admin/products")}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-white/70">Producto no encontrado</p>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-500" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </div>
      )}
    </div>
  )
}

