"use client"
import { Card } from "@/components/ui/card"
import { useDivision } from "@/context/DivisionContext"

export function MediaSection() {
  const { isIndustrial } = useDivision()

  return (
    <section id="media" className="relative py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 uppercase">
            {isIndustrial ? "OPERACIONES " : "NUESTRO "}
            <span className="text-primary transition-colors duration-500">{isIndustrial ? "INDUSTRIALES" : "CONTENIDO"}</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8 transition-colors duration-500" />
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Video 1 */}
          <Card className="bg-card/80 backdrop-blur-sm border-border overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="aspect-video relative overflow-hidden">
              <iframe
                src={isIndustrial ? "https://www.youtube.com/embed/ByXChq1VubU" : "https://www.youtube.com/embed/ByXChq1VubU"}
                title="Star Citizen Gameplay"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 tracking-wide uppercase">{isIndustrial ? "Minería en grupo" : "Actividades Sandbox"}</h3>
            </div>
          </Card>

          {/* Video 2 */}
          <Card className="bg-card/80 backdrop-blur-sm border-border overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="aspect-video relative overflow-hidden bg-muted">
              <iframe
                src={isIndustrial ? "https://www.youtube.com/embed/Yop7ZlqdskQ" : "https://www.youtube.com/embed/Yop7ZlqdskQ"}
                title="Star Citizen Gameplay"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 tracking-wide uppercase">{isIndustrial ? "Logística de Carga" : "Contratos PVP"}</h3>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}