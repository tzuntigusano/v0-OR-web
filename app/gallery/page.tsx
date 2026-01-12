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

export default function GalleryPage() {
  // Estados de la Galería
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [filtros, setFiltros] = useState<FiltroPadre[]>([])
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

  // 1. CARGA DE DATOS INICIAL (Filtros y Usuario)
  useEffect(() => {
    async function initializePage() {
      try {
        setLoading(true)

        // A. Verificar Usuario y Rol
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()
          if (roleData) setUserRole(roleData.role)
        }

        // B. Cargar Filtros de la DB
        const { data: filtersData, error: filtersError } = await supabase
          .from('filtros_padre')
          .select(`id, nombre, filtros_hijo (id, nombre)`)
          .order('orden', { ascending: true })

        if (filtersData) {
          const listaLimpia = filtersData.filter(f => f.nombre.toUpperCase() !== "TODOS")
          setFiltros(listaLimpia)
          
          // Inicializar valores del modal
          if (listaLimpia.length > 0) {
            setUploadData(prev => ({
              ...prev,
              padreId: listaLimpia[0].id,
              hijoId: listaLimpia[0].filtros_hijo?.[0]?.id || ""
            }))
          }
        }
      } catch (err) {
        console.error("Error inicializando página:", err)
      } finally {
        setLoading(false)
      }
    }
    initializePage()
  }, [])

  // 2. LÓGICA DE FILTRADO (Aquí iría la consulta a imagenes_galeria)
  // Por ahora mantenemos el array vacío o de ejemplo hasta que hagamos el fetch de fotos
  const galleryImages: any[] = [] 

  const handleFilterSelect = (stage: string, subcategory: string | null = null) => {
    setFilter({ stage, subcategory })
    setHoveredStage(null)
  }

  // 3. LÓGICA DE SUBIDA (Storage + DB)
  const handleUploadSubmit = async () => {
    if (!uploadData.file || !uploadData.padreId || !user) return

    try {
      setIsUploading(true)

      // Compresión
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true }
      const compressedFile = await imageCompression(uploadData.file, options)

      // Subida a Storage
      const fileExt = uploadData.file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('galeria')
        .upload(filePath, compressedFile)

      if (uploadError) throw uploadError

      // Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage.from('galeria').getPublicUrl(filePath)

      // Insertar en Tabla
      const { error: dbError } = await supabase.from('imagenes_galeria').insert([{
        url: publicUrl,
        alt: uploadData.alt,
        filtro_padre_id: uploadData.padreId,
        filtro_hijo_id: uploadData.hijoId || null,
        subido_por: user.id
      }])

      if (dbError) throw dbError

      alert("Imagen subida con éxito a la galería de Outraiders")
      setShowUploadModal(false)
    } catch (error) {
      console.error(error)
      alert("Error en el proceso de subida")
    } finally {
      setIsUploading(false)
    }
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
            Explora el universo a través de los ojos de nuestra organización.
          </p>
        </div>

        {/* Botón de subida condicional por Rol */}
        {(userRole === 'admin' || userRole === 'editor') && (
          <div className="flex justify-center mb-12">
            <Button onClick={() => setShowUploadModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide px-8 py-6 gap-2 text-lg">
              <Upload className="w-6 h-6" /> SUBIR NUEVA CAPTURA
            </Button>
          </div>
        )}

        {/* --- FILTROS DINÁMICOS --- */}
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
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 z-50">
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
           {/* Aquí mapearás los resultados de la DB */}
           {galleryImages.length === 0 && !loading && <p className="col-span-full text-center text-foreground/30 py-20">No hay imágenes que coincidan con el filtro.</p>}
        </div>

        {/* --- MODAL DE SUBIDA --- */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <div className="bg-black border-2 border-primary/30 rounded-lg p-8 max-w-md w-full shadow-[0_0_50px_rgba(var(--primary),0.2)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6 text-primary">
                <h2 className="text-2xl font-bold tracking-tighter">CENTRO DE CARGA</h2>
                <button onClick={() => setShowUploadModal(false)}><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-primary/60 mb-1 block tracking-widest">Descripción</label>
                  <input type="text" placeholder="Ej: Batalla en Pyro..." className="w-full bg-zinc-900 border-2 border-primary/20 rounded px-4 py-3 outline-none focus:border-primary transition-all" onChange={(e) => setUploadData({...uploadData, alt: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-primary/60 mb-1 block tracking-widest">Etapa</label>
                    <select value={uploadData.padreId} className="w-full bg-zinc-900 border-2 border-primary/20 rounded p-2 text-sm" onChange={(e) => {
                      const p = filtros.find(f => f.id === e.target.value)
                      setUploadData({...uploadData, padreId: e.target.value, hijoId: p?.filtros_hijo?.[0]?.id || ""})
                    }}>
                      {filtros.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-primary/60 mb-1 block tracking-widest">Subcategoría</label>
                    <select value={uploadData.hijoId} className="w-full bg-zinc-900 border-2 border-primary/20 rounded p-2 text-sm" onChange={(e) => setUploadData({...uploadData, hijoId: e.target.value})}>
                      {filtros.find(f => f.id === uploadData.padreId)?.filtros_hijo.map(h => (
                        <option key={h.id} value={h.id}>{h.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-primary/10">
                  <input type="file" accept="image/*" className="text-xs text-foreground/50 file:bg-primary/10 file:text-primary file:border-primary/20 file:rounded file:px-4 file:py-2 file:mr-4 hover:file:bg-primary/20 cursor-pointer w-full" onChange={(e) => e.target.files && setUploadData({...uploadData, file: e.target.files[0]})} />
                </div>

                <Button onClick={handleUploadSubmit} disabled={!uploadData.file || isUploading} className="w-full bg-primary hover:bg-primary/90 py-7 font-bold text-lg shadow-lg">
                  {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
                  {isUploading ? "PROCESANDO..." : "CONFIRMAR SUBIDA"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}