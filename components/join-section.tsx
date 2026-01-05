"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, MessageSquare } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export function JoinSection() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section id="join" className="relative py-24 px-4 bg-black/60 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {"ÚNETE A "}
            <span className="text-primary">OUTRAIDERS</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8" />
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-pretty">
            {
              "¿Listo para formar parte de la élite? Completa el formulario y un oficial de reclutamiento se pondrá en contacto contigo."
            }
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
                <h3 className="text-lg font-bold mb-2 tracking-wide">SERVIDOR DISCORD</h3>
                <p className="text-foreground/70 text-sm leading-relaxed mb-3">
                  Únete a nuestra activa comunidad en Discord para coordinar misiones y conocer a otros miembros.
                </p>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 bg-transparent"
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
            <h3 className="text-lg font-bold mb-0 tracking-wide text-primary">REQUISITOS</h3>
            <ul className="-mt-1 space-y-2 text-sm text-foreground/80">
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
            {
              "Al enviar tu solicitud, aceptas nuestros términos y condiciones. Te responderemos en un plazo de 24-48 horas."
            }
          </p>
        </div>
      </div>
    </section>
  )
}
