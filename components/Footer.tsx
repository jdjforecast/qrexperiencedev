export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <p className="text-blanco">© {currentYear} Nestle Digital Pharma Summit. Todos los derechos reservados.</p>
    </footer>
  )
}

