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
  
  // Estado para el Modal de Subida
  const [uploadData, setUploadData] = useState({
    stage: "",
    subcategory: "",
    alt: "",
    file: null as File | null,
  })

  // 1. CARGAR FILTROS DESDE SUPABASE
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
          const listaFiltros = data.filter(f => f.nombre.toUpperCase() !== "TODOS");
          setFiltros(listaFiltros);
          
          // Inicializar el formulario con el primer padre e hijo de la DB
          if (listaFiltros.length > 0) {
            setUploadData(prev => ({
              ...prev,
              stage: listaFiltros[0].nombre,
              subcategory: listaFiltros[0].filtros_hijo?.[0]?.nombre || ""
            }));
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

  // 2. FILTRADO DE IMÁGENES (Ejemplo estático)
  const galleryImages = [
    { id: 1, src: "/outraiders-team-meeting.webp", alt: "Reunión táctica", stage: "ETAPA 1", subcategory: "Exploración Inicial" },
    { id: 2, src: "/star-citizen-spaceship-fleet-in-space-battle.jpg", alt: "Combate espacial", stage: "ETAPA 3", subcategory: "Batallas" },
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

  // --- LÓGICA DEL MODAL ---
  const handlePadreChange = (nombrePadre: string) => {
    const padreSeleccionado = filtros.find(f => f.nombre === nombrePadre);
    setUploadData({
      ...uploadData,
      stage: nombrePadre,
      // Al cambiar el padre, ponemos automáticamente el primer hijo de ese nuevo padre
      subcategory: padreSeleccionado?.filtros_hijo?.[0]?.nombre || ""
    });
  };

  const handleUploadSubmit = () => {
    console.log("Datos listos para enviar a Supabase:", uploadData);
    alert(`Enviando imagen a ${uploadData.stage} > ${uploadData.subcategory}`);
    setShowUploadModal(false);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wider">
            GALERÍA <span className="text-primary">OUTRAIDERS</span>
          </h1>
        </div>

        <div className="flex justify-center mb-12">
          <Button onClick={() => setShowUploadModal(true)} className="bg-primary font-bold tracking-wide px-6 py-3 gap-2">
            <Upload className="w-5 h-5" /> SUBIR IMAGEN
          </Button>
        </div>

        {/* --- FILTROS DE LA PÁGINA --- */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-4 justify-center max-w-6xl w-full">
            <button
              onClick={() => handleFilterSelect("TODOS")}
              className={`px-6 py-2 rounded border-2 transition-all font-medium ${
                filter.stage === "TODOS" ? "bg-primary text-primary-foreground border-primary" : "border-primary/30 text-foreground/80 hover:border-primary"
              }`}
            >
              TODOS
            </button>

            {filtros.map((padre) => {
              const tieneHijos = padre.filtros_hijo && padre.filtros_hijo.length > 0;
              return (
                <div key={padre.id} className="relative" onMouseEnter={() => tieneHijos && setHoveredStage(padre.nombre)} onMouseLeave={() => setHoveredStage(null)}>
                  <button
                    onClick={() => handleFilterSelect(padre.nombre)}
                    className={`px-6 py-2 rounded border-2 transition-all font-medium flex items-center gap-2 ${
                      filter.stage === padre.nombre ? "bg-primary text-primary-foreground border-primary" : "border-primary/30 text-foreground/80 hover:border-primary"
                    }`}
                  >
                    {padre.nombre} {tieneHijos && <ChevronDown className="w-4 h-4" />}
                  </button>
                  {hoveredStage === padre.nombre && tieneHijos && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 bg-black/95 border-2 border-primary/30 rounded shadow-2xl z-50">
                      {padre.filtros_hijo.map((hijo) => (
                        <button key={hijo.id} onClick={() => handleFilterSelect(padre.nombre, hijo.nombre)} className="w-full text-left px-4 py-3 hover:bg-primary/20 hover:text-primary transition-colors text-sm border-b border-primary/10 last:border-b-0">
                          {hijo.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- GRID DE IMÁGENES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredImages.map((image, index) => (
            <div key={image.id} className="group relative aspect-video overflow-hidden rounded border-2 border-primary/20 hover:border-primary cursor-pointer" onClick={() => setSelectedImage(index)}>
              <Image src={image.src} alt={image.alt} fill className="object-cover transition-transform group-hover:scale-110" />
            </div>
          ))}
        </div>

        {/* --- MODAL DE SUBIDA DINÁMICO --- */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <div className="bg-black border-2 border-primary/30 rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-wider text-primary">SUBIR IMAGEN</h2>
                <button onClick={() => setShowUploadModal(false)}><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-6">
                {/* Selector Padre */}
                <div>
                  <label className="block text-xs font-bold text-primary mb-2 uppercase">Categoría Principal</label>
                  <select
                    value={uploadData.stage}
                    onChange={(e) => handlePadreChange(e.target.value)}
                    className="w-full bg-zinc-900 border-2 border-primary/20 rounded px-4 py-3 text-foreground focus:border-primary outline-none transition-all"
                  >
                    {filtros.map(f => (
                      <option key={f.id} value={f.nombre}>{f.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Selector Hijo (Dependiente del Padre) */}
                <div>
                  <label className="block text-xs font-bold text-primary mb-2 uppercase">Subcategoría</label>
                  <select
                    value={uploadData.subcategory}
                    onChange={(e) => setUploadData({ ...uploadData, subcategory: e.target.value })}
                    className="w-full bg-zinc-900 border-2 border-primary/20 rounded px-4 py-3 text-foreground focus:border-primary outline-none transition-all"
                  >
                    {filtros
                      .find(f => f.nombre === uploadData.stage)
                      ?.filtros_hijo.map(h => (
                        <option key={h.id} value={h.nombre}>{h.nombre}</option>
                      )) || <option value="">Sin subcategorías</option>
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-2 uppercase">Archivo de Imagen</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => e.target.files && setUploadData({ ...uploadData, file: e.target.files[0] })}
                    className="w-full text-sm text-foreground/60 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" 
                  />
                </div>

                <Button onClick={handleUploadSubmit} disabled={!uploadData.file} className="w-full bg-primary hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all py-6 font-bold text-lg">
                  GUARDAR EN GALERÍA
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}