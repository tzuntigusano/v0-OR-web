import { Card } from "@/components/ui/card"
import { SkullIcon, Users, TrafficConeIcon, ContactIcon } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 px-4 bg-black/60 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            {"QUIÉNES "}
            <span className="text-primary">SOMOS</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8" />
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed text-pretty">
            Outraiders es más que una organización, somos una hermandad de pilotos unidos por la pasión de explorar,
            conquistar y dominar el vasto universo de Star Citizen. Nuestra misión es clara: convertirnos en la fuerza
            más respetada y temida del verso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 p-6 group hover:scale-105">
            <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <SkullIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">PIRATE FRIENDLY</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              {"Parte de nuestro gameplay se basa en la piratería, siempre de manera legítima.\nNo admitimos murder-hobos."}
            </p>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 p-6 group hover:scale-105">
            <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">EQUIPO &gt; INDIVIDUO   </h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Firmemente convencidos de que lo que nos lleva al éxito al afrontar desafios no es la suma de las habilidades individuales sino nuestro nivel como equipo.
            </p>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 p-6 group hover:scale-105">
            <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <TrafficConeIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">HIGHEND</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Mantenemos un espíritu competitivo, llevando la experiencia de juego a un nivel superior.
            </p>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 p-6 group hover:scale-105">
            <div className="w-12 h-12 bg-primary/20 rounded-sm flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <ContactIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-wide">COMUNIDAD</h3>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Presencia activa en eventos de la comunidad, servicios de protección, QRF (Flotas de respuesta rápida), incursiones FPS y Combate de naves, etc..
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6">NUESTRA VISIÓN</h3>
            <div className="space-y-4 text-foreground/80 leading-relaxed">
              <p>
                En Outraiders creemos que el verdadero poder reside en la unión de pilotos excepcionales que comparten
                valores comunes: lealtad, excelencia y ambición desmedida.
              </p>
              <p>
                {
                  "Ofrecemos entrenamiento especializado, recursos avanzados y una estructura organizada que permite a cada miembro alcanzar su máximo potencial, ya sea en combate, comercio, exploración o minería."
                }
              </p>
              <p className="font-semibold text-primary">
                Únete a nosotros y sé parte de algo más grande. El universo nos espera.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-video rounded-sm overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/20">
              <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ScreenShot-2025-12-30_17-52-40-138.png-t0H5Db1uzxJKy6kEQmr0aenM8ZamkV.webp" alt="Outraiders Fleet" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-sm blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
