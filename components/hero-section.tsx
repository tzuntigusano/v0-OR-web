"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useDivision } from "@/context/DivisionContext"
import { Factory, Target } from "lucide-react"

export function HeroSection() {
  const { isIndustrial, setDivision } = useDivision()

  const toggleDivision = () => {
    setDivision(isIndustrial ? "PVP" : "INDUSTRIAL")
  }

  const content = {
    title: isIndustrial ? "DIVISIÓN" : "BIENVENIDO A",
    highlight: isIndustrial ? "INDUSTRIAL" : "OUTRAIDERS",
    description: isIndustrial 
      ? "Nuestra columna vertebral logística. Especialistas en minería a gran escala, refinamiento y transporte pesado en el sistema Stanton y más allá."
      : "Organización muy activa de habla hispana. Principalmente enfocados en el PVP y Operaciones Tácticas Avanzadas con división civil integrada."
  }

  // Estilos invertidos para el botón móvil
  const mobileToggleStyles = isIndustrial
    ? "bg-[#ff0000] hover:bg-[#cc0000] text-white !border-transparent"
    : "bg-[#00ffff] hover:bg-[#00cccc] text-black !border-transparent";

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4">
      <div className="container text-center z-10 px-0 mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight text-balance uppercase transition-all duration-500">
          {content.title} <span className="text-primary">{content.highlight}</span>
        </h1>

        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed text-pretty">
          {content.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* BOTÓN 1: ÚNETE */}
          <Button
            size="lg"
            asChild
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide px-8 py-6 text-lg transition-colors duration-500"
          >
            <a href="https://google.es" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
              ÚNETE
              <Image src="/discord-logo.png" alt="Discord" width={26} height={26} className="ml-2" />
            </a>
          </Button>

          {/* BOTÓN 2: CAMBIO DE DIVISIÓN (SOLO MÓVIL) */}
          <Button
            size="lg"
            onClick={toggleDivision}
            className={`w-full sm:hidden font-black tracking-tighter px-8 py-6 text-lg shadow-xl animate-in fade-in zoom-in duration-500 ${mobileToggleStyles}`}
          >
            <div className="flex items-center gap-3">
              {isIndustrial ? <Target className="w-6 h-6" /> : <Factory className="w-6 h-6" />}
              DIVISIÓN {isIndustrial ? "PVP" : "INDUSTRIAL"}
            </div>
          </Button>

          {/* BOTÓN 3: CONOCE MÁS */}
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-foreground/20 hover:border-primary hover:bg-primary/10 text-foreground font-semibold tracking-wide px-8 py-6 text-lg backdrop-blur-sm bg-transparent transition-all duration-500"
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
          <div className="w-1 h-3 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  )
}