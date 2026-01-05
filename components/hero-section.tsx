"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4">
      <div className="container text-center z-10 px-0 mx-auto">
        <div className="mb-6 inline-block"></div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight text-balance">
          BIENVENIDO A <span className="text-primary">OUTRAIDERS</span>
        </h1>

        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed text-pretty">
          {
            "Organización muy activa de habla hispana.Principalmente enfocados en el PVP y Operaciones Tácticas Avanzadas. Con división civil para jugadores menos tryhards que solo quieren echar el rato."
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide px-8 py-6 text-lg group"
          >
            <a href="https://google.es" target="_blank" rel="noopener noreferrer" className="flex items-center">
              ÚNETE
              <Image src="/discord-logo.png" alt="Discord" width={26} height={26} className="mr-2 inline-block" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-foreground/20 hover:border-primary hover:bg-primary/10 text-foreground font-semibold tracking-wide px-8 py-6 text-lg backdrop-blur-sm bg-transparent"
            onClick={() => {
              const element = document.getElementById("about")
              if (element) element.scrollIntoView({ behavior: "smooth" })
            }}
          >
            CONOCE MÁS
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
