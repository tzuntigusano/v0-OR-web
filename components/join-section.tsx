"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, MessageSquare } from "lucide-react"
import { useDivision } from "@/context/DivisionContext"
import Image from "next/image"

export function JoinSection() {
  const { isIndustrial } = useDivision()

  return (
    <section id="join" className="relative py-24 px-4 bg-black/60 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 uppercase">
            {isIndustrial ? "ÚNETE A LA FLOTA " : "ÚNETE A "}
            <span className="text-primary transition-colors duration-500">OUTRAIDERS</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8 transition-colors duration-500" />
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-pretty">
            {isIndustrial 
              ? "¿Quieres dominar el mercado y las extracciones masivas? Buscamos operadores industriales dedicados."
              : "¿Listo para formar parte de la élite? Entra en nuestro Discord y conócenos."}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
  
          {/* CARD 1: SERVIDOR DISCORD */}
          <Card className="bg-card/80 backdrop-blur-sm border-border p-6 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 tracking-wide uppercase">SERVIDOR DISCORD</h3>
                <p className="text-foreground/70 text-sm leading-relaxed mb-3">
                  Únete a nuestra activa comunidad en Discord para coordinar misiones y conocer a otros miembros.
                </p>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 bg-transparent transition-colors duration-500"
                  size="sm"
                  asChild
                >
                  <a href="https://google.es" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    UNIRSE A DISCORD
                    <Image
                      src="/discord-logo.png"
                      alt="Discord"
                      width={21}
                      height={21}
                      className="ml-2 inline-block"
                    />
                  </a>
                </Button>
              </div>
            </div>
          </Card>

          {/* CARD 2: REQUISITOS */}
          <Card className="bg-primary/10 backdrop-blur-sm border-primary/30 p-6">
            <h3 className="text-lg font-bold mb-4 tracking-wide text-primary transition-colors duration-500 uppercase">REQUISITOS</h3>
            <ul className="space-y-3 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Ser mayor de 18 años</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Tener Star Citizen instalado</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Compromiso con el trabajo en equipo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Actitud positiva y ganas de aprender</span>
              </li>
            </ul>
          </Card>

        </div>

        <div className="mt-16 text-center">
          <p className="text-foreground/60 text-sm">
            Al unirte, aceptas nuestras normas de convivencia. Te esperamos en el verso.
          </p>
        </div>
      </div>
    </section>
  )
}