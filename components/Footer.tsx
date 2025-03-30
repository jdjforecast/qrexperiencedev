export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-azul-oscuro/90 text-white text-sm text-center py-4 mt-auto shadow-md">
      <div className="container mx-auto px-4">
        © {currentYear} Nestle Digital Pharma Summit. Todos los derechos reservados.
      </div>
    </footer>
  )
}

