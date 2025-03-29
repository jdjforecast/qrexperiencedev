# Sistema de Códigos QR - Digital Pharma Summit

Este documento describe la implementación del sistema de códigos QR para la aplicación Digital Pharma Summit.

## Arquitectura del Sistema

El sistema de códigos QR consta de los siguientes componentes:

1. **Generación de QR**: Genera códigos QR vinculados a productos específicos
2. **Escaneo de QR**: Escanea códigos QR utilizando la cámara del dispositivo
3. **Procesamiento de QR**: Extrae información del producto y actualiza contadores
4. **Visualización de Productos**: Muestra información de productos y permite añadirlos al carrito

## Estructura de Datos

Los códigos QR contienen un objeto JSON simplificado con la siguiente estructura:

```json
{
  "code": "AA6F99B4",
  "product_id": "7b039128-48c3-4916-87e9-ea7450ae37ee"
}

