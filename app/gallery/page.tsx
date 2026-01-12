"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { X, Upload, ChevronDown, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

// --- Interfaces ---
interface FiltroHijo {
  id: string
  nombre: string
}

interface FiltroPadre {
  id: string
  nombre: string
  filtros_hijo: FiltroHijo[]
}

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [filtros, setFiltros] = useState<FiltroPadre[]>([])
  const [loading, setLoading] = useState(true)
  
  const [filter, setFilter] = useState<{ stage: string; subcategory: string | null }>({
    stage: "TODOS",
    subcategory: null,
  })
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    stage: "",
    subcategory: "",
    alt: "",
    file: null as File | null,
  })

  // 1. Cargar filtros desde Supabase
  useEffect(() => {
    async function loadFilters() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('filtros_padre')
          .select(`
            id,
            nombre,
            filtros_hijo (
              id,
              nombre
            )
          `)
          .order('orden', { ascending: true });

        if (error) throw error;
        
        if (data) {
          setFiltros(data);
          // Inicializar datos de subida con el primer padre/hijo disponible
          if (data.length > 0) {
            setUploadData(prev => ({
              ...prev,
              stage: data[0].nombre,
              subcategory: data[0].filtros_hijo?.[0]?.nombre || ""
            }))
          }
        }
      } catch (err) {
        console.error("Error cargando filtros:", err);
      } finally {
        setLoading(false)
      }
    }
    loadFilters()
  }, [])

  // Datos de ejemplo (Esto debería venir de una tabla 'imagenes_galeria' en el futuro)
  const galleryImages = [
    { id: 1, src: "/outraiders-team-meeting.webp", alt: "Reunión táctica", stage: "ETAPA 1", subcategory: "Exploración Inicial" },
    { id: 2, src: "/star-citizen-spaceship-fleet-in-space-battle.jpg", alt: "Combate espacial", stage: "ETAPA 3", subcategory: "Batallas" },
    { id: 3, src: "/star-citizen-pilot-in-cockpit-looking-at-space.jpg", alt: "Piloto en cabina", stage: "ETAPA 1", subcategory: "Primeras Misiones" },
    { id: 4, src: "/star-citizen-space-station-exterior-view-with-ship.jpg", alt: "Estación espacial", stage: "ETAPA 2", subcategory: "Territorio" },
    { id: 5, src: "/star-citizen-large-capital-ship-battle-formation.jpg", alt: "Naves capitales", stage: "ETAPA 4", subcategory: "Dominación" },
    { id: 6, src: "/star-citizen-crew-members-working-together-in-ship.jpg", alt: "Equipo", stage: "ETAPA 2", subcategory: "Alianzas" },
  ]

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
    console.log("Subiendo...", uploadData)
    alert(`Imagen guardada para ${uploadData.stage}`)
    setShowUploadModal(false)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wider">
            GALERÍA <span className="text-primary">OUTRAIDERS</span>
          </h1>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            Momentos épicos de la flota gestionados dinámicamente.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide px-6 py-3 gap-2"
          >
            <Upload className="w-5 h-5" />
            SUBIR IMAGEN
          </Button>
        </div>

        {/* --- SECCIÓN DE FILTROS DINÁMICOS --- */}
        <div className="flex justify-center mb-12">
          {/* max-w-6xl asegura que los filtros no sean más anchos que la grid de fotos */}
          <div className="flex flex-wrap gap-4 justify-center max-w-6xl w-full">
            {loading ? (
              <Loader2 className="animate-spin text-primary" />
            ) : (
              <>
                {/* Botón TODOS Fijo */}
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

                {/* Mapeo de Filtros (Evitando duplicado de TODOS) */}
                {filtros
                  .filter((f) => f.nombre.toUpperCase() !== "TODOS")
                  .map((padre) => {
                    const tieneHijos = padre.filtros_hijo && padre.filtros_hijo.length > 0;
                    
                    return (
                      <div
                        key={padre.id}
                        className="relative"
                        onMouseEnter={() => tieneHijos && setHoveredStage(padre.nombre)}
                        onMouseLeave={() => setHoveredStage(null)}
                      >
                        <button
                          onClick={() => handleFilterSelect(padre.nombre)}
                          className={`px-6 py-2 rounded border-2 transition-all font-medium tracking-wide flex items-center gap-2 ${
                            filter.stage === padre.nombre
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-primary/30 text-foreground/80 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {padre.nombre}
                          {tieneHijos && <ChevronDown className="w-4 h-4" />}
                        </button>

                        {/* Dropdown que salta de línea si es necesario */}
                        {hoveredStage === padre.nombre && tieneHijos && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 bg-black/95 border-2 border-primary/30 rounded shadow-2xl backdrop-blur-md z-50">
                            {padre.filtros_hijo.map((hijo) => (
                              <button
                                key={hijo.id}
                                onClick={() => handleFilterSelect(padre.nombre, hijo.nombre)}
                                className="w-full text-left px-4 py-3 hover:bg-primary/20 hover:text-primary transition-colors text-sm font-medium tracking-wide border-b border-primary/10 last:border-b-0"
                              >
                                {hijo.nombre}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        </div>

        {/* --- GRID DE IMÁGENES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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

        {/* --- MODAL SUBIDA --- */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <div className="bg-black border-2 border-primary/30 rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-6">SUBIR IMAGEN</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">ETAPA</label>
                  <select
                    value={uploadData.stage}
                    onChange={(e) => {
                      const selected = filtros.find(f => f.nombre === e.target.value);
                      setUploadData({...uploadData, stage: e.target.value, subcategory: selected?.filtros_hijo?.[0]?.nombre || ""});
                    }}
                    className="w-full bg-black border-2 border-primary/30 rounded px-4 py-2"
                  >
                    {filtros.map(f => <option key={f.id} value={f.nombre}>{f.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">SUBCATEGORÍA</label>
                  <select
                    value={uploadData.subcategory}
                    onChange={(e) => setUploadData({...uploadData, subcategory: e.target.value})}
                    className="w-full bg-black border-2 border-primary/30 rounded px-4 py-2"
                  >
                    {filtros.find(f => f.nombre === uploadData.stage)?.filtros_hijo.map(h => (
                      <option key={h.id} value={h.nombre}>{h.nombre}</option>
                    ))}
                  </select>
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full py-2" />
                <Button onClick={handleUploadSubmit} disabled={!uploadData.file} className="w-full">GUARDAR</Button>
              </div>
            </div>
          </div>
        )}

        {/* --- LIGHTBOX --- */}
        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-4 right-4 text-foreground hover:text-primary"><X className="w-8 h-8" /></button>
            <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <Image 
                src={filteredImages[selectedImage].src} 
                alt={filteredImages[selectedImage].alt} 
                width={1920} height={1080} 
                className="object-contain max-h-full w-auto" 
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}