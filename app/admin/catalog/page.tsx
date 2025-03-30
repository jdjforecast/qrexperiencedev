"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { getAllProducts, createProduct, updateProduct, deleteProduct, type Product } from "../../../lib/products"
import { useToast } from "../../../components/ui/use-toast"
import { Loader2 } from "lucide-react"
import AdminLayout from "../../../components/admin-layout"

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
  })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      const data = await getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const price = Number.parseFloat(newProduct.price)
      if (isNaN(price)) {
        throw new Error("El precio debe ser un número válido")
      }

      const result = await createProduct({
        name: newProduct.name,
        description: newProduct.description,
        price,
        image_url: newProduct.image_url || null,
        stock: 0,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(), // Código aleatorio simple
      })

      if (!result.success) {
        throw new Error(result.error || "Error al crear el producto")
      }

      setNewProduct({
        name: "",
        description: "",
        price: "",
        image_url: "",
      })

      toast({
        title: "Éxito",
        description: "Producto creado correctamente",
      })

      await loadProducts()
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "No se pudo crear el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!editingProduct) return

    try {
      setLoading(true)
      const price = Number.parseFloat(editingProduct.price.toString())
      if (isNaN(price)) {
        throw new Error("El precio debe ser un número válido")
      }

      const result = await updateProduct(editingProduct.id, {
        name: editingProduct.name,
        description: editingProduct.description,
        price,
        image_url: editingProduct.image_url || null,
      })

      if (!result.success) {
        throw new Error(result.error || "Error al actualizar el producto")
      }

      setEditingProduct(null)
      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      })

      await loadProducts()
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "No se pudo actualizar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return

    try {
      setLoading(true)
      const result = await deleteProduct(id)

      if (!result.success) {
        throw new Error(result.error || "Error al eliminar el producto")
      }

      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      })
      await loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "No se pudo eliminar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Catálogo</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && !editingProduct ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.description}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                                Editar
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                                Eliminar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Nombre
                      </label>
                      <Input
                        id="name"
                        value={editingProduct ? editingProduct.name : newProduct.name}
                        onChange={(e) =>
                          editingProduct
                            ? setEditingProduct({ ...editingProduct, name: e.target.value })
                            : setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Descripción
                      </label>
                      <Input
                        id="description"
                        value={editingProduct ? editingProduct.description : newProduct.description}
                        onChange={(e) =>
                          editingProduct
                            ? setEditingProduct({ ...editingProduct, description: e.target.value })
                            : setNewProduct({ ...newProduct, description: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label htmlFor="price" className="block text-sm font-medium mb-1">
                        Precio
                      </label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={editingProduct ? editingProduct.price : newProduct.price}
                        onChange={(e) =>
                          editingProduct
                            ? setEditingProduct({ ...editingProduct, price: e.target.value })
                            : setNewProduct({ ...newProduct, price: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="image_url" className="block text-sm font-medium mb-1">
                        URL de Imagen
                      </label>
                      <Input
                        id="image_url"
                        value={editingProduct ? editingProduct.image_url || "" : newProduct.image_url}
                        onChange={(e) =>
                          editingProduct
                            ? setEditingProduct({ ...editingProduct, image_url: e.target.value })
                            : setNewProduct({ ...newProduct, image_url: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      {editingProduct && (
                        <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                          Cancelar
                        </Button>
                      )}
                      <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingProduct ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

