import type React from "react"
export function BackgroundContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-nestle overflow-hidden">
      {/* Elementos circulares decorativos */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-nestle-blue-light/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float" />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-nestle-blue-dark/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-nestle-blue-medium/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float"
        style={{ animationDelay: "4s" }}
      />

      {/* Patrón de fondo sutil */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Contenido principal con efecto parallax */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

