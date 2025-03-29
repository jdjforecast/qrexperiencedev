export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
      <div className="prose prose-invert max-w-none">
        <p className="mb-4">Última actualización: {new Date().toLocaleDateString()}</p>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">1. Recopilación de Datos</h2>
          <p>
            Recopilamos información personal que usted nos proporciona directamente, incluyendo su nombre, correo
            electrónico y datos de contacto.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">2. Uso de la Información</h2>
          <p>Utilizamos la información recopilada para:</p>
          <ul className="list-disc pl-6">
            <li>Proporcionar y mejorar nuestros servicios</li>
            <li>Comunicarnos con usted sobre su cuenta</li>
            <li>Enviar actualizaciones y notificaciones importantes</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">3. Protección de Datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra
            acceso no autorizado o alteración.
          </p>
        </section>
      </div>
    </div>
  )
}

