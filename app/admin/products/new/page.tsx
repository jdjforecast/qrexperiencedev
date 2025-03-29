"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { createProduct, uploadProductImage } from "@/lib/storage/products"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"

export default function NewProductPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await getCurrentUser()
      if (user) {
        setUserId(user.id)

        // Check if user is admin
        const admin = await isAdmin(user.id)
        setIsUserAdmin(admin)

        if (admin) {
          setIsLoading(false)
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
  }, [router])

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
      // Crear el producto
      const { data, error: createError } = await createProduct({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        stock: formData.stock,
        max_per_user: formData.max_per_user,
        sku: formData.sku,
        image_url: null, // Será actualizado después si hay una imagen
      })

      if (createError) {
        throw createError
      }

      if (!data || !data.id) {
        throw new Error("No se pudo crear el producto")
      }

      // Si hay una imagen, subirla
      if (imageFile) {
        const { error: uploadError } = await uploadProductImage(imageFile, data.id)

        if (uploadError) {
          console.error("Error al subir la imagen, pero el producto fue creado:", uploadError)
          toast({
            title: "Advertencia",
            description: "Producto creado, pero hubo un error al subir la imagen",
            variant: "default",
          })
        }
      }

      toast({
        title: "Producto creado",
        description: "El producto se ha creado correctamente",
        variant: "default",
      })

      // Redirigir a la lista de productos
      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product:", error)
      setError(error instanceof Error ? error.message : "Error al crear el producto")

      toast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-6">{error}</div>}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
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
                  Crear producto
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

