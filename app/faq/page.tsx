export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Preguntas Frecuentes</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">¿Qué es Mi Partner Nestlé?</h2>
          <p>
            Mi Partner Nestlé es una plataforma diseñada para gestionar la relación entre Nestlé y sus partners,
            facilitando la comunicación, el seguimiento de actividades y la gestión de recursos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">¿Cómo puedo acceder a la plataforma?</h2>
          <p>
            Para acceder a la plataforma, necesitas ser un partner registrado de Nestlé. Puedes iniciar sesión con tu
            correo electrónico y contraseña en la página de login.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">¿Qué hago si olvidé mi contraseña?</h2>
          <p>
            Si olvidaste tu contraseña, puedes usar la opción "Recuperar Contraseña" en la página de login. Te
            enviaremos un correo electrónico con las instrucciones para restablecerla.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">¿Cómo puedo contactar soporte?</h2>
          <p>
            Si necesitas ayuda adicional, puedes contactar al equipo de soporte a través del correo electrónico de
            soporte o usando el formulario de contacto en la plataforma.
          </p>
        </section>
      </div>
    </div>
  )
}

