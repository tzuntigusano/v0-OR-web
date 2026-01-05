"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { X, Upload, ChevronDown } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const stageCategories = {
  "ETAPA 1": ["Exploración Inicial", "Primeras Misiones", "Encuentros", "Descubrimientos", "Logros Tempranos"],
  "ETAPA 2": ["Expansión", "Nuevas Naves", "Alianzas", "Territorio", "Recursos"],
  "ETAPA 3": ["Consolidación", "Operaciones Mayores", "Eventos Épicos", "Batallas", "Victorias"],
  "ETAPA 4": ["Dominación", "Supremacía", "Legendarios", "Conquistas", "Gloria"],
}

const galleryImages = [
  {
    id: 1,
    src: "/outraiders-team-meeting.webp",
    alt: "Reunión táctica de Outraiders",
    stage: "ETAPA 1",
    subcategory: "Exploración Inicial",
  },
  {
    id: 2,
    src: "/star-citizen-spaceship-fleet-in-space-battle.jpg",
    alt: "Flota de naves en combate espacial",
    stage: "ETAPA 3",
    subcategory: "Batallas",
  },
  {
    id: 3,
    src: "/star-citizen-pilot-in-cockpit-looking-at-space.jpg",
    alt: "Piloto en cabina",
    stage: "ETAPA 1",
    subcategory: "Primeras Misiones",
  },
  {
    id: 4,
    src: "/star-citizen-space-station-exterior-view-with-ship.jpg",
    alt: "Estación espacial",
    stage: "ETAPA 2",
    subcategory: "Territorio",
  },
  {
    id: 5,
    src: "/star-citizen-large-capital-ship-battle-formation.jpg",
    alt: "Formación de naves capitales",
    stage: "ETAPA 4",
    subcategory: "Dominación",
  },
  {
    id: 6,
    src: "/star-citizen-crew-members-working-together-in-ship.jpg",
    alt: "Tripulación trabajando en equipo",
    stage: "ETAPA 2",
    subcategory: "Alianzas",
  },
  {
    id: 7,
    src: "/star-citizen-planet-landing-approach-view-from-coc.jpg",
    alt: "Aproximación a planeta",
    stage: "ETAPA 1",
    subcategory: "Descubrimientos",
  },
  {
    id: 8,
    src: "/star-citizen-multiple-ships-flying-in-tight-format.jpg",
    alt: "Formación de escuadrón",
    stage: "ETAPA 3",
    subcategory: "Operaciones Mayores",
  },
  {
    id: 9,
    src: "/star-citizen-asteroid-mining-operation-with-ships.jpg",
    alt: "Operación de minería",
    stage: "ETAPA 2",
    subcategory: "Recursos",
  },
]

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [filter, setFilter] = useState<{ stage: string; subcategory: string | null }>({
    stage: "TODOS",
    subcategory: null,
  })
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    stage: "ETAPA 1",
    subcategory: "Exploración Inicial",
    alt: "",
    file: null as File | null,
  })

  const filteredImages =
    filter.stage === "TODOS"
      ? galleryImages
      : filter.subcategory
        ? galleryImages.filter((img) => img.stage === filter.stage && img.subcategory === filter.subcategory)
        : galleryImages.filter((img) => img.stage === filter.stage)

  const handleFilterSelect = (stage: string, subcategory: string | null = null) => {
    setFilter({ stage, subcategory })
    setHoveredStage(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] })
    }
  }

  const handleUploadSubmit = () => {
    // Aquí implementarías la lógica de upload real
    console.log("[v0] Upload data:", uploadData)
    alert(`Imagen guardada para ${uploadData.stage} -> ${uploadData.subcategory}`)
    setShowUploadModal(false)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wider text-balance">
            GALERÍA <span className="text-primary">OUTRAIDERS</span>
          </h1>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto text-pretty">
            Explora momentos épicos de nuestra organización en el vasto universo de Star Citizen
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide px-6 py-3 gap-2"
          >
            <Upload className="w-5 h-5" />
            SUBIR IMAGEN
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {/* Botón TODOS */}
          <button
            onClick={() => handleFilterSelect("TODOS")}
            className={`px-6 py-2 rounded border-2 transition-all font-medium tracking-wide ${
              filter.stage === "TODOS"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-primary/30 text-foreground/80 hover:border-primary hover:text-primary"
            }`}
          >
            TODOS
          </button>

          {/* Botones de Etapas con dropdowns */}
          {Object.keys(stageCategories).map((stage) => (
            <div
              key={stage}
              className="relative"
              onMouseEnter={() => setHoveredStage(stage)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              <button
                onClick={() => handleFilterSelect(stage)}
                className={`px-6 py-2 rounded border-2 transition-all font-medium tracking-wide flex items-center gap-2 ${
                  filter.stage === stage
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-primary/30 text-foreground/80 hover:border-primary hover:text-primary"
                }`}
              >
                {stage}
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown con subcategorías */}
              {hoveredStage === stage && (
                <div className="absolute top-full left-0 pt-2 w-64 bg-black/95 border-2 border-primary/30 rounded shadow-lg backdrop-blur-sm z-10">
                  {stageCategories[stage as keyof typeof stageCategories].map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => handleFilterSelect(stage, subcategory)}
                      className="w-full text-left px-4 py-3 hover:bg-primary/20 hover:text-primary transition-colors text-sm font-medium tracking-wide border-b border-primary/10 last:border-b-0"
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filter.stage !== "TODOS" && (
          <div className="text-center mb-8">
            <p className="text-foreground/70">
              Mostrando:{" "}
              <span className="text-primary font-semibold">
                {filter.stage}
                {filter.subcategory && ` → ${filter.subcategory}`}
              </span>
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-video overflow-hidden rounded border-2 border-primary/20 hover:border-primary transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedImage(index)}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                  <p className="text-sm text-primary font-semibold tracking-wider mb-1">
                    {image.stage} - {image.subcategory}
                  </p>
                  <p className="text-foreground font-medium">{image.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showUploadModal && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <div
              className="bg-black border-2 border-primary/30 rounded-lg p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-wider">SUBIR IMAGEN</h2>
                <button onClick={() => setShowUploadModal(false)} className="text-foreground hover:text-primary">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 tracking-wide">ETAPA</label>
                  <select
                    value={uploadData.stage}
                    onChange={(e) =>
                      setUploadData({
                        ...uploadData,
                        stage: e.target.value,
                        subcategory: stageCategories[e.target.value as keyof typeof stageCategories][0],
                      })
                    }
                    className="w-full bg-black border-2 border-primary/30 rounded px-4 py-2 text-foreground focus:border-primary outline-none"
                  >
                    {Object.keys(stageCategories).map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 tracking-wide">SUBCATEGORÍA</label>
                  <select
                    value={uploadData.subcategory}
                    onChange={(e) => setUploadData({ ...uploadData, subcategory: e.target.value })}
                    className="w-full bg-black border-2 border-primary/30 rounded px-4 py-2 text-foreground focus:border-primary outline-none"
                  >
                    {stageCategories[uploadData.stage as keyof typeof stageCategories].map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  
                  
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 tracking-wide">ARCHIVO</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full bg-black border-2 border-primary/30 rounded px-4 py-2 text-foreground focus:border-primary outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:font-medium hover:file:bg-primary/90"
                  />
                </div>

                <Button
                  onClick={handleUploadSubmit}
                  disabled={!uploadData.file}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide py-3"
                >
                  GUARDAR IMAGEN
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-foreground hover:text-primary transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>

            <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <Image
                src={filteredImages[selectedImage].src || "/placeholder.svg"}
                alt={filteredImages[selectedImage].alt}
                width={1920}
                height={1080}
                className="object-contain max-h-full w-auto rounded"
                onClick={(e) => e.stopPropagation()}
              />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                <p className="text-sm text-primary font-semibold tracking-wider mb-2">
                  {filteredImages[selectedImage].stage} - {filteredImages[selectedImage].subcategory}
                </p>
                <p className="text-foreground text-lg font-medium">{filteredImages[selectedImage].alt}</p>
              </div>

              {/* Navigation Buttons */}
              {selectedImage > 0 && (
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-foreground p-4 rounded border border-primary/30 transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(selectedImage - 1)
                  }}
                >
                  ←
                </button>
              )}

              {selectedImage < filteredImages.length - 1 && (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/20 hover:bg-primary/40 backdrop-blur-sm text-foreground p-4 rounded border border-primary/30 transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(selectedImage + 1)
                  }}
                >
                  →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
