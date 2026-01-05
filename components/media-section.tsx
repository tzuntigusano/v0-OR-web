import { Card } from "@/components/ui/card"

export function MediaSection() {
  return (
    <section id="media" className="relative py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {"NUESTRO "}
            <span className="text-primary">CONTENIDO</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8" />
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-pretty">
            Explora nuestras misiones épicas, combates intensos y momentos inolvidables en el universo de Star Citizen.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-card/80 backdrop-blur-sm border-border overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="aspect-video relative overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/ByXChq1VubU"
                title="Star Citizen Gameplay"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 tracking-wide">ACTIVIDADES SANDBOX</h3>
              <p className="text-foreground/70 text-sm">
                Actividades sandbox organizadas con organizaciones internacionales
              </p>
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border overflow-hidden group hover:border-primary/50 transition-all duration-300">
            <div className="aspect-video relative overflow-hidden bg-muted">
              <iframe
                src="https://www.youtube.com/embed/Yop7ZlqdskQ"
                title="Star Citizen Gameplay"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 tracking-wide">CONTRATOS PVP</h3>
              <p className="text-foreground/70 text-sm">Contratos PVP personalizados contra objetivos concretos</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative aspect-square rounded-sm overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 group">
            <img
              src="/images/outraiders-flotas-1x1.webp"
              alt="Gallery 1"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-foreground font-semibold tracking-wide">BASE DE OPERACIONES</span>
            </div>
          </div>

          <div className="relative aspect-square rounded-sm overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 group">
            <img
              src="/images/screenshot-2025-01-12-23-37-32-fa5.webp"
              alt="Gallery 2"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-foreground font-semibold tracking-wide">OPERACIONES MINERAS</span>
            </div>
          </div>

          <div className="relative aspect-square rounded-sm overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 group">
            <img
              src="/outraiders-team-meeting.webp"
              alt="Gallery 3"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center mx-0">
              <span className="text-foreground font-semibold tracking-wide">REUNIONES TÁCTICAS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
