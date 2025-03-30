"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth"
import Link from "next/link"
import Image from "next/image"
import { PageTransition, AnimateOnView } from "@/components/ui/page-transition"
import { PageTemplate, PageContent } from "@/components/ui/page-template"
import { Button } from "@/components/ui/button"
import { QrCode, LogIn, Package, ArrowRight } from "lucide-react"

export default function HomePage() {
  const { user, loading: isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  return (
    <PageTemplate activeTab="home">
      <PageTransition type="fade">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <PageContent>
            <div className="text-center">
              {/* Logo */}
              <div className="mb-8 flex justify-center">
                <Image
                  src="/images/nestledigitalpharmasummitvertical.svg"
                  alt="Nestle Digital Pharma Summit"
                  width={200}
                  height={100}
                  priority
                  className="drop-shadow-md"
                />
              </div>

              <AnimateOnView type="slide-up" delay={0.1}>
                <h1 className="mb-4 text-3xl font-bold text-accent md:text-4xl">
                  Escanea, Elige y Recibe
                </h1>
              </AnimateOnView>

              <AnimateOnView type="slide-up" delay={0.2}>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
                  Regístrate, recibe tus monedas, escanea códigos QR y canjea productos exclusivos de QRexperience
                </p>
              </AnimateOnView>

              {!user && (
                <AnimateOnView type="slide-up" delay={0.3}>
                  <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
                    <Button
                      size="lg"
                      className="btn-primary rounded-full"
                      onClick={() => router.push("/scan")}
                    >
                      <QrCode className="mr-2 h-5 w-5" />
                      Escanear QR
                    </Button>
                    <Button 
                      size="lg"
                      className="btn-secondary rounded-full"
                      onClick={() => router.push("/login")}
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      Iniciar Sesión
                    </Button>
                  </div>
                </AnimateOnView>
              )}
            </div>
          </PageContent>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-16">
          <PageContent>
            <AnimateOnView>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Cómo Funciona</h2>
                <p className="mx-auto max-w-3xl text-lg text-white/80">
                  Sigue estos sencillos pasos para comenzar a disfrutar de la experiencia QRexperience
                </p>
              </div>
            </AnimateOnView>

            <div className="grid gap-8 md:grid-cols-4">
              {[
                {
                  step: 1,
                  title: "Regístrate",
                  description: "Crea una cuenta y recibe tus monedas de bienvenida",
                  delay: 0.1
                },
                {
                  step: 2,
                  title: "Escanea QR",
                  description: "Busca códigos QR para ver productos disponibles",
                  delay: 0.2
                },
                {
                  step: 3,
                  title: "Elige Productos",
                  description: "Selecciona los productos que deseas obtener",
                  delay: 0.3
                },
                {
                  step: 4,
                  title: "Recibe tus Productos",
                  description: "Finaliza tu compra y recoge tus productos",
                  delay: 0.4
                }
              ].map((step, index) => (
                <AnimateOnView key={step.step} type="slide-up" delay={step.delay}>
                  <div className="card hover-lift">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-white shadow-lg">
                        <span className="text-3xl font-bold">{step.step}</span>
                        {index < 3 && (
                          <div className="absolute right-0 top-1/2 hidden h-1 w-16 -translate-y-1/2 md:flex md:items-center">
                            <div className="h-2 w-2 rounded-full bg-white/60"></div>
                            <div className="mx-1 h-2 w-2 rounded-full bg-white/60"></div>
                            <div className="mx-1 h-2 w-2 rounded-full bg-white/60"></div>
                            <div className="h-2 w-2 rounded-full bg-white/60"></div>
                          </div>
                        )}
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-white">{step.title}</h3>
                      <p className="text-white/80">{step.description}</p>
                    </div>
                  </div>
                </AnimateOnView>
              ))}
            </div>
          </PageContent>
        </section>

        {/* Call to Action */}
        <section className="py-12">
          <PageContent>
            <AnimateOnView type="fade">
              <div className="card-solid text-center py-12 px-6">
                <h2 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h2>
                <p className="text-white/80 max-w-2xl mx-auto mb-8">
                  Únete ahora y descubre todos los productos exclusivos que tenemos para ti
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button 
                    size="lg"
                    className="btn-primary rounded-full"
                    onClick={() => router.push("/register")}
                  >
                    Crear Cuenta
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg"
                    className="btn-outline rounded-full"
                    onClick={() => router.push("/products")}
                  >
                    <Package className="mr-2 h-5 w-5" />
                    Ver Productos
                  </Button>
                </div>
              </div>
            </AnimateOnView>
          </PageContent>
        </section>
      </PageTransition>
    </PageTemplate>
  )
}

