"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { X, Upload, ChevronDown, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import imageCompression from 'browser-image-compression'

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

interface GaleriaImagen {
  id: string
  src: string
  alt: string
  stage: string
  subcategory: string | null
}

export default function GalleryPage() {
  // Estados de la Galería
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [filtros, setFiltros] = useState<FiltroPadre[]>([])
  const [images, setImages] = useState<GaleriaImagen[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  
  // Estados de Usuario y Roles
  const [userRole, setUserRole] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Estados de Filtro Activo
  const [filter, setFilter] = useState<{ stage: string; subcategory: string | null }>({
    stage: "TODOS",
    subcategory: null,
  })
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)
  
  // Estados del Modal de Subida
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    padreId: "",
    hijoId: "",
    alt: "",
    file: null as File | null,
  })

  // 1. CARGA DE IMÁGENES DESDE LA DB
  async function fetchImages() {
    try {
      const { data, error } = await supabase
        .from('imagenes_galeria')
        .select(`
          id,
          url,
          alt,
          filtros_padre (nombre),
          filtros_hijo (nombre)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map((img: any) => ({
          id: img.id,
          src: img.url,
          alt: img.alt,
          stage: img.filtros_padre?.nombre || "",
          subcategory: img.filtros_hijo?.nombre || null
        }));
        setImages(formatted);
      }
    } catch (err) {
      console.error("Error cargando imágenes:", err);
    }
  }

  // 2. INICIALIZACIÓN (Filtros, Usuario y Fotos)
  useEffect(() => {
    async function initializePage() {
      setLoading(true)
      
      // A. Cargar Filtros
      const { data: filtersData } = await supabase
        .from('filtros_padre')
        .select(`id, nombre, filtros_hijo (id, nombre)`)
        .order('orden', { ascending: true })

      if (filtersData) {
        const listaLimpia = filtersData.filter(f => f.nombre.toUpperCase() !== "TODOS")
        setFiltros(listaLimpia)
        if (listaLimpia.length > 0) {
          setUploadData(prev => ({
            ...prev,
            padreId: listaLimpia[0].id,
            hijoId: listaLimpia[0].filtros_hijo?.[0]?.id || ""
          }))
        }
      }

      // B. Cargar Imágenes Reales
      await fetchImages();
      setLoading(false)
    }

    initializePage()

    // C. Control de Sesión Reactivo
    const fetchRole = async (userId: string) => {
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle()
      if (data) setUserRole(data.role)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) fetchRole(currentUser.id)
      else setUserRole(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 3. LÓGICA DE FILTRADO EN EL FRONTEND
  const filteredImages = filter.stage === "TODOS"
    ? images
    : filter.subcategory
      ? images.filter((img) => img.stage === filter.stage && img.subcategory === filter.subcategory)
      : images.filter((img) => img.stage === filter.stage)

  const handleFilterSelect = (stage: string, subcategory: string | null = null) => {
    setFilter({ stage, subcategory })
    setHoveredStage(null)
  }

  // 4. LÓGICA DE SUBIDA
  const handleUploadSubmit = async () => {
    if (!uploadData.file || !uploadData.padreId || !user) return

    try {
      setIsUploading(true)
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true }
      const compressedFile = await imageCompression(uploadData.file, options)

      const fileExt = uploadData.file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('galeria')
        .upload(filePath, compressedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('galeria').getPublicUrl(filePath)

      const { error: dbError } = await supabase.from('imagenes_galeria').insert([{
        url: publicUrl,
        alt: uploadData.alt,
        filtro_padre_id: uploadData.padreId,
        filtro_hijo_id: uploadData.hijoId || null,
        subido_por: user.id
      }])

      if (dbError) throw dbError

      alert("¡Imagen guardada en la flota!")
      setShowUploadModal(false)
      await fetchImages() // RECARGA LA GRID AUTOMÁTICAMENTE
    } catch (error) {
      console.error(error)
      alert("Error al subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wider uppercase">
            Galería <span className="text-primary">Outraiders</span>
          </h1>
        </div>

        {/* --- BOTÓN SUBIDA --- */}
        {(userRole === 'admin' || userRole === 'editor') && (
          <div className="flex justify-center mb-12">
            <Button onClick={() => setShowUploadModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 gap-2 text-lg">
              <Upload className="w-6 h-6" /> SUBIR IMAGEN
            </Button>
          </div>
        )}

        {/* --- FILTROS --- */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-4 justify-center max-w-6xl w-full">
            {loading ? <Loader2 className="animate-spin text-primary" /> : (
              <>
                <button
                  onClick={() => handleFilterSelect("TODOS")}
                  className={`px-6 py-2 rounded border-2 transition-all font-medium ${
                    filter.stage === "TODOS" ? "bg-primary border-primary text-primary-foreground" : "border-primary/30 text-foreground/70 hover:border-primary"
                  }`}
                >
                  TODOS
                </button>

                {filtros.map((padre) => {
                  const tieneHijos = padre.filtros_hijo && padre.filtros_hijo.length > 0
                  return (
                    <div key={padre.id} className="relative" onMouseEnter={() => tieneHijos && setHoveredStage(padre.nombre)} onMouseLeave={() => setHoveredStage(null)}>
                      <button
                        onClick={() => handleFilterSelect(padre.nombre)}
                        className={`px-6 py-2 rounded border-2 transition-all font-medium flex items-center gap-2 ${
                          filter.stage === padre.nombre ? "bg-primary border-primary text-primary-foreground" : "border-primary/30 text-foreground/70 hover:border-primary"
                        }`}
                      >
                        {padre.nombre} {tieneHijos && <ChevronDown className="w-4 h-4" />}
                      </button>

                      {hoveredStage === padre.nombre && tieneHijos && (
                        <div className="absolute top-full left-0 pt-2 w-64 z-50">
                          <div className="bg-black border-2 border-primary/30 rounded shadow-2xl backdrop-blur-md overflow-hidden">
                            {padre.filtros_hijo.map((hijo) => (
                              <button key={hijo.id} onClick={() => handleFilterSelect(padre.nombre, hijo.nombre)} className="w-full text-left px-4 py-3 hover:bg-primary/20 hover:text-primary transition-colors text-sm border-b border-primary/10 last:border-b-0">
                                {hijo.nombre}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>

        {/* --- GRID DE IMÁGENES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {loading ? (
            <div className="col-span-full flex flex-col items-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary w-12 h-12" />
              <p className="text-primary/60 animate-pulse font-bold">CARGANDO ARCHIVOS DE LA FLOTA...</p>
            </div>
          ) : filteredImages.length > 0 ? (
            filteredImages.map((image, index) => (
              <div 
                key={image.id} 
                className="group relative aspect-video overflow-hidden rounded border-2 border-primary/20 hover:border-primary cursor-pointer transition-all"
                onClick={() => setSelectedImage(index)}
              >
                <Image src={image.src} alt={image.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                    {image.stage} {image.subcategory && `// ${image.subcategory}`}
                  </p>
                  <p className="text-white text-sm font-medium truncate">{image.alt}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-primary/10 rounded">
              <p className="text-foreground/30 uppercase tracking-[0.3em]">Sector sin registros visuales</p>
            </div>
          )}
        </div>

        {/* --- LIGHTBOX --- */}
        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-4 lg:p-12" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-8 right-8 text-white/50 hover:text-primary transition-colors"><X className="w-10 h-10" /></button>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image 
                src={filteredImages[selectedImage].src} 
                alt={filteredImages[selectedImage].alt} 
                width={1920} height={1080} 
                className="object-contain max-h-full w-auto shadow-[0_0_100px_rgba(var(--primary),0.1)]" 
              />
            </div>
          </div>
        )}

        {/* --- MODAL DE SUBIDA --- */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <div className="bg-black border-2 border-primary/30 rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary uppercase tracking-tighter">Cargar Evidencia</h2>
                <button onClick={() => setShowUploadModal(false)}><X className="w-6 h-6 hover:text-primary transition-colors" /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-primary/60 uppercase">Título de la captura</label>
                  <input type="text" className="w-full bg-zinc-900 border-2 border-primary/20 rounded px-4 py-3 outline-none focus:border-primary transition-all text-sm" onChange={(e) => setUploadData({...uploadData, alt: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-primary/60 uppercase">Etapa</label>
                    <select value={uploadData.padreId} className="w-full bg-zinc-900 border-2 border-primary/20 rounded p-3 text-xs outline-none" onChange={(e) => {
                      const p = filtros.find(f => f.id === e.target.value)
                      setUploadData({...uploadData, padreId: e.target.value, hijoId: p?.filtros_hijo?.[0]?.id || ""})
                    }}>
                      {filtros.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-primary/60 uppercase">Subcategoría</label>
                    <select value={uploadData.hijoId} className="w-full bg-zinc-900 border-2 border-primary/20 rounded p-3 text-xs outline-none" onChange={(e) => setUploadData({...uploadData, hijoId: e.target.value})}>
                      {filtros.find(f => f.id === uploadData.padreId)?.filtros_hijo.map(h => (
                        <option key={h.id} value={h.id}>{h.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <input type="file" accept="image/*" className="text-xs w-full file:bg-primary file:text-black file:font-bold file:border-0 file:rounded file:px-3 file:py-2 file:mr-3 cursor-pointer" onChange={(e) => e.target.files && setUploadData({...uploadData, file: e.target.files[0]})} />
                </div>

                <Button onClick={handleUploadSubmit} disabled={!uploadData.file || isUploading} className="w-full bg-primary hover:bg-primary/90 py-6 font-black uppercase tracking-widest text-black">
                  {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 w-5 h-5" />}
                  {isUploading ? "Cifrando..." : "Transmitir a Galería"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}