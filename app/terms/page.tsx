export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>
      <div className="prose prose-invert max-w-none">
        <p className="mb-4">Última actualización: {new Date().toLocaleDateString()}</p>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar esta plataforma, usted acepta estar sujeto a estos términos y condiciones.</p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">2. Uso del Servicio</h2>
          <p>
            Esta plataforma está diseñada para gestionar la relación entre Nestlé y sus partners. Usted se compromete a
            utilizar el servicio de manera legal y ética.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">3. Privacidad y Seguridad</h2>
          <p>
            Nos comprometemos a proteger su privacidad y la seguridad de sus datos. Consulte nuestra política de
            privacidad para más información.
          </p>
        </section>
      </div>
    </div>
  )
}

