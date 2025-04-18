"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCart } from "@/components/cart/CartProvider"
import { getBrowserClient } from "@/lib/supabase-client-browser"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedName = localStorage.getItem('buyerName') || '';
    const savedCompanyName = localStorage.getItem('buyerCompanyName') || '';
    setFormData(prev => ({ ...prev, fullName: savedName, companyName: savedCompanyName }));
  }, []);

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-gray-600">
            Tu carrito está vacío. Por favor agrega productos antes de proceder al checkout.
          </p>
          <div className="mt-6 text-center">
            <Link href="/scan" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              Escanear Productos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === 'fullName') localStorage.setItem('buyerName', value);
    if (name === 'companyName') localStorage.setItem('buyerCompanyName', value);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (items.length === 0) {
        throw new Error("El carrito está vacío.");
      }

      // Crear objeto con información del cliente desde el estado del formulario
      const customerInfo = {
        fullName: formData.fullName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone || null, // Enviar null si está vacío
      };

      // Crear order items desde el carrito (asegurándose de incluir el precio)
      const orderItemsPayload = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price, // Asegúrate de que esto esté disponible en useCart()
      }));

      // --- Llamada real a la API --- 
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          customerInfo, 
          items: orderItemsPayload, 
          totalPrice // Enviar el precio total calculado en el frontend
        }),
      });

      const result = await response.json(); // Leer el cuerpo de la respuesta

      if (!response.ok || !result.success) {
        // Si la API devuelve un error (4xx, 5xx) o success: false
        throw new Error(result.message || 'Error al crear la orden en el servidor.');
      }
      
      // --- Éxito --- 
      const orderId = result.orderId; // Obtener el ID de la orden creada

      // Limpiar carrito después de orden exitosa
      clearCart()

      // Opcional: Limpiar Local Storage del comprador
      localStorage.removeItem('buyerName');
      localStorage.removeItem('buyerCompanyName');

      // Redirigir a página de confirmación/factura
      router.push(`/invoice/${orderId}`); // Usar el ID real devuelto por la API

    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Error al procesar la orden. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium mb-1">
                    Nombre de la Empresa *
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Link href="/cart" className="text-blue-600 hover:text-blue-800">
                  Volver al Carrito
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Procesando..." : "Completar Compra"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resumen de Orden</h2>

            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

