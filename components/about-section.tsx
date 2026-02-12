"use client"
import { Card } from "@/components/ui/card"
import { SkullIcon, Users, TrafficConeIcon, ContactIcon, Pickaxe, Package } from "lucide-react"
import { useDivision } from "@/context/DivisionContext"

export function AboutSection() {
  const { isIndustrial } = useDivision()

  return (
    <section id="about" className="relative py-24 px-4 bg-black/60 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance uppercase">
            {isIndustrial ? "LOGÍSTICA " : "QUIÉNES "}
            <span className="text-primary transition-colors duration-500">{isIndustrial ? "Y MINERÍA" : "SOMOS"}</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8 transition-colors duration-500" />
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed text-pretty">
            {isIndustrial 
              ? "Outraiders Industrial es la fuerza motriz de nuestra organización. Suministramos recursos, gestionamos flotas de carga y dominamos el mercado de materiales en el verso."
              : "Outraiders es más que una organización, somos una hermandad de pilotos unidos por la pasión de explorar, conquistar y dominar el vasto universo de Star Citizen."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Card 1 */}
          <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 p-6 group hover:scale-105">
            <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              {isIndustrial ? <Pickaxe className="w-6 h-6 text-primary" /> : <SkullIcon className="w-6 h-6 text-primary" />}
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">{isIndustrial ? "EXTRACCIÓN" : "PIRATE FRIENDLY"}</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              {isIndustrial 
                ? "Operaciones coordinadas de minería masiva con naves refinadoras y escolta pesada."
                : "Parte de nuestro gameplay se basa en la piratería, siempre de manera legítima."}
            </p>
          </Card>

          {/* Card 2 */}
          <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 p-6 group hover:scale-105">
            <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">MULTICREW</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Optimizamos el rendimiento de grandes naves industriales mediante el trabajo coordinado en equipo.
            </p>
          </Card>

          {/* Card 3 */}
          <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 p-6 group hover:scale-105">
            <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              {isIndustrial ? <Package className="w-6 h-6 text-primary" /> : <TrafficConeIcon className="w-6 h-6 text-primary" />}
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">{isIndustrial ? "LOGÍSTICA" : "HIGHEND"}</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              {isIndustrial 
                ? "Cadena de suministro eficiente desde el punto de extracción hasta la venta final."
                : "Mantenemos un espíritu competitivo, llevando la experiencia de juego a un nivel superior."}
            </p>
          </Card>

          {/* Card 4 */}
          <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 p-6 group hover:scale-105">
            <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <ContactIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">ECONOMÍA</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Controlamos rutas comerciales y fluctuaciones del mercado para financiar nuestras operaciones.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}