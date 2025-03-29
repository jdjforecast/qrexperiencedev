"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, QrCode, ExternalLink, Smartphone, ShoppingCart, Check, AlertTriangle, Wand2 } from "lucide-react"

export default function QRInstructionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Productos
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Guía para QR Scan-to-Cart</h1>
        <p className="text-gray-600">
          Aprende a generar códigos QR que dirijan a los clientes directamente a las páginas de productos
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-blue-600" />
            ¿Qué es "Scan to Cart"?
          </h2>
          <p className="mt-2 text-gray-700">
            Scan to Cart es una funcionalidad que permite a los clientes escanear un código QR y acceder directamente a
            la página de un producto específico, donde pueden ver toda la información y agregarlo a su carrito con un
            solo clic.
          </p>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Beneficios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Experiencia mejorada</h4>
              <p className="text-sm text-blue-700">
                Los clientes pueden acceder a los productos sin buscar, mejorando la experiencia de usuario.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Mayor conversión</h4>
              <p className="text-sm text-green-700">
                Reduce la fricción entre el interés y la compra, aumentando las tasas de conversión.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Analíticas detalladas</h4>
              <p className="text-sm text-purple-700">
                Registra cada escaneo para entender mejor el comportamiento de los clientes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <Wand2 className="h-5 w-5 mr-2 text-blue-600" />
            Paso 1: Preparar las URLs de productos
          </h2>
          <p className="mt-2 text-gray-700">
            Antes de generar QR codes, necesitas asegurarte de que tus productos tienen URLs amigables y optimizadas.
            Esto hará que los códigos QR sean más efectivos y fáciles de compartir.
          </p>
        </div>

        <div className="p-6">
          <ol className="list-decimal pl-6 space-y-6">
            <li className="text-gray-800">
              <p className="font-medium">Accede a la sección de URLs de productos</p>
              <p className="text-sm text-gray-600 mt-1">
                Ve a{" "}
                <Link href="/admin/products/urls" className="text-blue-600 underline">
                  Gestión de productos {">"} URLs
                </Link>{" "}
                para ver y modificar las URLs de todos tus productos.
              </p>
              <div className="flex justify-center my-4">
                <div className="border rounded overflow-hidden max-w-lg">
                  <div className="bg-gray-100 p-3 text-xs font-mono">
                    https://mipartnerv0.vercel.app/admin/products/urls
                  </div>
                  <div className="p-2 border-t">
                    <p className="text-sm font-medium">Aquí podrás:</p>
                    <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
                      <li>Ver las URLs actuales de todos los productos</li>
                      <li>Generar URLs optimizadas automáticamente</li>
                      <li>Personalizar las URLs manualmente si lo prefieres</li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>

            <li className="text-gray-800">
              <p className="font-medium">Genera URLs amigables</p>
              <p className="text-sm text-gray-600 mt-1">
                Usa el botón{" "}
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                  <Wand2 className="h-3 w-3 mr-1" /> Generar
                </span>{" "}
                para cada producto, o{" "}
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                  <Wand2 className="h-3 w-3 mr-1" /> Generar sugerencias
                </span>{" "}
                para todos los productos a la vez.
              </p>
              <div className="flex justify-center my-4">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800 text-sm">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 inline-block mr-2" />
                  <span className="font-medium">Importante:</span> Una vez que actualices una URL, cualquier QR anterior
                  apuntando a esa URL dejará de funcionar.
                </div>
              </div>
            </li>

            <li className="text-gray-800">
              <p className="font-medium">Verifica las URLs</p>
              <p className="text-sm text-gray-600 mt-1">
                Haz clic en el botón{" "}
                <span className="inline-flex items-center bg-gray-100 px-2 py-1 rounded text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" /> Ver página
                </span>{" "}
                para verificar que la página del producto se muestra correctamente.
              </p>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-3 text-green-800 text-sm">
                <Check className="h-5 w-5 text-green-600 inline-block mr-2" />
                Asegúrate de que la página muestra correctamente:
                <ul className="list-disc pl-5 mt-2">
                  <li>Imagen del producto</li>
                  <li>Nombre y descripción</li>
                  <li>Precio y disponibilidad</li>
                  <li>Botón de "Agregar al carrito" funcionando</li>
                </ul>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-blue-600" />
            Paso 2: Generar Códigos QR Externos
          </h2>
          <p className="mt-2 text-gray-700">
            Una vez que tienes las URLs optimizadas, puedes generar códigos QR con herramientas externas y registrarlos
            en el sistema para seguimiento.
          </p>
        </div>

        <div className="p-6">
          <ol className="list-decimal pl-6 space-y-6">
            <li className="text-gray-800">
              <p className="font-medium">Elige una herramienta de generación de QR</p>
              <p className="text-sm text-gray-600 mt-1">
                Puedes usar cualquiera de estas herramientas gratuitas online:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <a
                  href="https://www.qr-code-generator.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="font-medium mb-2">QR Code Generator</div>
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </a>
                <a
                  href="https://www.the-qrcode-generator.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="font-medium mb-2">The QR Code Generator</div>
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </a>
                <a
                  href="https://es.qr-code-generator.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="font-medium mb-2">QR Code Generator (ES)</div>
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </a>
              </div>
            </li>

            <li className="text-gray-800">
              <p className="font-medium">Registra el QR en el sistema para seguimiento</p>
              <p className="text-sm text-gray-600 mt-1">
                Para habilitar el seguimiento de escaneos, registra el QR en:
                <Link href="/admin/qr-codes/create" className="block text-blue-600 underline mt-1">
                  https://mipartnerv0.vercel.app/admin/qr-codes/create
                </Link>
              </p>
              <div className="flex justify-center my-4">
                <div className="border rounded overflow-hidden max-w-lg">
                  <div className="p-3 border-b">
                    <ol className="list-decimal text-sm pl-5 space-y-2">
                      <li>Selecciona el producto</li>
                      <li>Genera o ingresa un código único para el QR</li>
                      <li>Copia la URL completa con tracking</li>
                      <li>Usa esta URL para generar el QR con la herramienta externa</li>
                    </ol>
                  </div>
                  <div className="bg-blue-50 p-3 text-sm text-blue-800">
                    Esto permite rastrear cada escaneo para analíticas
                  </div>
                </div>
              </div>
            </li>

            <li className="text-gray-800">
              <p className="font-medium">Personaliza el diseño del QR (opcional)</p>
              <p className="text-sm text-gray-600 mt-1">
                Muchas herramientas te permiten personalizar los colores, añadir un logo o cambiar el estilo del QR para
                hacerlo más atractivo y reconocible.
              </p>
              <div className="flex justify-center my-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-800 text-sm">
                  <p className="font-medium mb-2">Consejos para personalizar QRs:</p>
                  <ul className="list-disc pl-5">
                    <li>Mantén alto el contraste entre los elementos del QR</li>
                    <li>No ocupes más del 30% del centro con un logo</li>
                    <li>Prueba siempre el QR antes de imprimirlo o distribuirlo</li>
                    <li>Usa colores de la marca para mantener la identidad visual</li>
                  </ul>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
            Paso 3: Implementación y uso
          </h2>
          <p className="mt-2 text-gray-700">
            Una vez que tengas los códigos QR generados, puedes implementarlos en diferentes materiales y ubicaciones.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-lg mb-3">Ideas de implementación</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Etiquetas o envases de productos</li>
                <li>Catálogos impresos o digitales</li>
                <li>Material promocional y volantes</li>
                <li>Exhibidores en tiendas físicas</li>
                <li>Tarjetas de presentación</li>
                <li>Emails de marketing</li>
                <li>Redes sociales</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-3">Experiencia del usuario</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ol className="list-decimal pl-5 space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <QrCode className="h-5 w-5 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>Cliente escanea el QR con la cámara de su teléfono</span>
                  </li>
                  <li className="flex items-start">
                    <Smartphone className="h-5 w-5 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>Se abre la página del producto específico</span>
                  </li>
                  <li className="flex items-start">
                    <ShoppingCart className="h-5 w-5 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>Con un solo clic puede agregar el producto al carrito</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span>El sistema registra el escaneo para análisis</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Consideraciones importantes
          </h2>
        </div>

        <div className="p-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="bg-amber-100 p-1 rounded-full mr-3 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Cambios en URLs</p>
                <p className="text-sm text-gray-600">
                  Si cambias la URL de un producto, todos los QR codes que apunten a la URL antigua dejarán de
                  funcionar. Asegúrate de finalizar la configuración de URLs antes de generar e imprimir QRs.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-amber-100 p-1 rounded-full mr-3 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Prueba antes de implementar</p>
                <p className="text-sm text-gray-600">
                  Siempre verifica que los QR codes escaneados lleven correctamente a la página del producto esperado y
                  que funcione la opción de agregar al carrito.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-amber-100 p-1 rounded-full mr-3 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Tamaño y calidad</p>
                <p className="text-sm text-gray-600">
                  Los QR codes deben tener un tamaño suficiente para ser escaneados fácilmente. Se recomienda un mínimo
                  de 2x2 cm en materiales impresos y con buena resolución.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex justify-center my-8">
        <Link href="/admin/products/urls">
          <Button className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Ir a gestionar URLs de productos
          </Button>
        </Link>
      </div>
    </div>
  )
}

