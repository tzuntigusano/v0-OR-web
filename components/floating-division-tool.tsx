"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useDivision } from "@/context/DivisionContext"
import { Factory, Target, ArrowRightLeft } from "lucide-react"

export function FloatingDivisionTool() {
  const { isIndustrial, setDivision } = useDivision()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 0.7;
      setIsVisible(window.scrollY <= threshold)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() 
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleDivision = () => {
    setDivision(isIndustrial ? "PVP" : "INDUSTRIAL")
  }

  const invertedStyles = isIndustrial 
    ? {
        accent: "text-[#ff0000]",
        button: "bg-[#ff0000] hover:bg-[#cc0000] text-white shadow-[#ff0000]/30",
        label: "PVP"
      }
    : {
        accent: "text-[#00ffff]",
        button: "bg-[#00ffff] hover:bg-[#00cccc] text-black shadow-[#00ffff]/30",
        label: "INDUSTRIAL"
      };

  return (
    <div 
      className={`fixed bottom-[4vh] right-[2vw] z-[90] hidden lg:flex flex-col items-end transition-all duration-700 ease-in-out ${
        isVisible 
          ? "opacity-100 translate-x-0 pointer-events-auto" 
          : "opacity-0 translate-x-20 pointer-events-none"
      }`}
    >
      <div className="w-[20vw] max-w-[280px] min-w-[240px] flex flex-col gap-3">
        
        {/* Mensaje flotante */}
        <div className="bg-black/95 backdrop-blur-xl border-2 border-white/10 p-[1.2vw] rounded-xl shadow-2xl w-full text-left">
          <p className={`text-[min(0.7vw,11px)] font-black mb-1 uppercase tracking-[0.2em] ${invertedStyles.accent}`}>
            ¿CAMBIAR A {invertedStyles.label}?
          </p>
          <p className="text-[min(0.95vw,15px)] text-white/90 leading-tight font-medium">
            {isIndustrial 
              ? "Regresa al frente de batalla y lidera las operaciones tácticas." 
              : "Optimiza tus beneficios y gestiona la logística pesada de la flota."}
          </p>
        </div>

        {/* Botón de acción - !border-transparent elimina el borde de la división actual */}
        <Button
          onClick={toggleDivision}
          className={`group ${invertedStyles.button} !border-transparent !ring-0 !outline-none font-black h-auto py-[min(1vw,16px)] px-[1.5vw] rounded-xl shadow-2xl transition-all duration-300 hover:brightness-110 active:scale-[0.98] w-full flex justify-between items-center`}
        >
          <div className="flex items-center gap-[1vw]">
            <div className="w-[min(1.8vw,24px)] h-[min(1.8vw,24px)] flex items-center justify-center">
              {isIndustrial ? (
                <Target className="w-full h-full" />
              ) : (
                <Factory className="w-full h-full" />
              )}
            </div>
            
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[min(0.6vw,9px)] opacity-80 mb-0.5 uppercase tracking-tighter">Activar división</span>
              <span className="text-[min(1.3vw,19px)] uppercase font-black tracking-tighter leading-none">
                {invertedStyles.label}
              </span>
            </div>
          </div>

          <ArrowRightLeft className="w-[min(1.2vw,16px)] h-[min(1.2vw,16px)] opacity-40 group-hover:rotate-180 transition-transform duration-500" />
        </Button>
      </div>
    </div>
  )
}