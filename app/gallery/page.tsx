"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { X, Upload, ChevronDown, Loader2, Trash2, CheckCircle2, Circle, Pin, PinOff } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import imageCompression from 'browser-image-compression'

// --- Interfaces ---
interface FiltroPadre {
  id: string
  nombre: string
  filtros_hijo: { id: string; nombre: string }[]
}

interface GaleriaImagen {
  id: string
  src: string
  alt: string
  stage: string
  subcategory: string | null
  fijada: boolean
}

export default function GalleryPage() {
  // Estados de Datos
  const [filtros, setFiltros] = useState<FiltroPadre[]>([])
  const [images, setImages] = useState<GaleriaImagen[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  
  // Estados de Usuario
  const [userRole, setUserRole] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Estados de Gestión (Admin)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  // Estados de Filtro y UI
  const [filter, setFilter] = useState<{ stage: string; subcategory: string | null }>({ stage: "TODOS", subcategory: null })
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({ padreId: "", hijoId: "", alt: "", file: null as File | null })

  // 1. CARGA DE IMÁGENES (Prioriza fijada, luego fecha)
  async function fetchImages() {
    try {
      const { data, error } = await supabase
        .from('imagenes_galeria')
        .select(`id, url, alt, fijada, filtros_padre (nombre), filtros_hijo (nombre)`)
        .order('fijada', { ascending: false })
        .order('created_at', { ascending: false });

      if (data) {
        const formatted = data.map((img: any) => ({
          id: img.id,
          src: img.url,
          alt: img.alt,
          fijada: img.fijada || false,
          stage: img.filtros_padre?.nombre || "",
          subcategory: img.filtros_hijo?.nombre || null
        }));
        setImages(formatted);
      }
    } catch (err) { console.error("Error fetch:", err); }
  }

  // 2. INICIALIZACIÓN
  useEffect(() => {
    async function init() {
      setLoading(true)
      const { data: fData } = await supabase.from('filtros_padre').select(`id, nombre, filtros_hijo (id, nombre)`).order('orden', { ascending: true })
      if (fData) {
        const lista = fData.filter(f => f.nombre.toUpperCase() !== "TODOS")
        setFiltros(lista)
        if (lista.length > 0) {
          setUploadData(prev => ({ ...prev, padreId: lista[0].id, hijoId: lista[0].filtros_hijo?.[0]?.id || "" }))
        }
      }
      await fetchImages();
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).maybeSingle()
        setUserRole(data?.role || null)
      } else setUserRole(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // 3. LÓGICA FILTRADO
  const filteredImages = filter.stage === "TODOS"
    ? images
    : filter.subcategory
      ? images.filter((img) => img.stage === filter.stage && img.subcategory === filter.subcategory)
      : images.filter((img) => img.stage === filter.stage)

  // 4. ACCIONES ADMIN
  const handleSelectAll = () => {
    if (selectedIds.length === filteredImages.length) setSelectedIds([])
    else setSelectedIds(filteredImages.map(img => img.id))
  }

  const toggleFijar = async (e: React.MouseEvent, imgId: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
      if (!currentStatus) {
        // Solo puede haber una fijada: quitamos el fijado a todas las demás
        await supabase.from('imagenes_galeria').update({ fijada: false }).neq('id', imgId)
      }
      const { error } = await supabase.from('imagenes_galeria').update({ fijada: !currentStatus }).eq('id', imgId)
      if (error) throw error
      await fetchImages()
    } catch (err) { alert("Error al fijar"); }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || !confirm(`¿Borrar ${selectedIds.length} imágenes?`)) return
    setIsDeleting(true)
    try {
      const { data: toDel } = await supabase.from('imagenes_galeria').select('url').in('id', selectedIds)
      if (toDel) {
        const paths = toDel.map(img => img.url.split('/galeria/')[1])
        await supabase.storage.from('galeria').remove(paths)
      }
      await supabase.from('imagenes_galeria').delete().in('id', selectedIds)
      setSelectedIds([]); setIsSelectionMode(false); await fetchImages()
    } finally { setIsDeleting(false) }
  }

  const handleUploadSubmit = async () => {
    if (!uploadData.file || !user) return
    setIsUploading(true)
    try {
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1920 }
      const compressed = await imageCompression(uploadData.file, options)
      const path = `${user.id}/${Math.random().toString(36).substring(2)}`
      await supabase.storage.from('galeria').upload(path, compressed)
      const { data: { publicUrl } } = supabase.storage.from('galeria').getPublicUrl(path)
      
      await supabase.from('imagenes_galeria').insert([{
        url: publicUrl, alt: uploadData.alt, filtro_padre_id: uploadData.padreId, 
        filtro_hijo_id: uploadData.hijoId || null, subido_por: user.id
      }])
      setUploadData(p => ({...p, file: null, alt: ""})); setShowUploadModal(false); await fetchImages()
    } finally { setIsUploading(false) }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-center text-4xl md:text-6xl font-bold mb-12 uppercase tracking-widest">Galería <span className="text-primary">Outraiders</span></h1>

        {/* --- PANEL DE ACCIONES --- */}
        <div className="flex flex-col items-center gap-4 mb-12">
          {(userRole === 'admin' || userRole === 'editor') && !isSelectionMode && (
            <Button onClick={() => setShowUploadModal(true)} className="bg-primary text-black font-bold px-8 py-6 text-lg uppercase tracking-tighter hover:bg-primary/80">
              <Upload className="mr-2 w-6 h-6" /> Subir Imagen
            </Button>
          )}

          {userRole === 'admin' && (
            <div className="flex flex-wrap justify-center gap-3">
              {!isSelectionMode ? (
                <Button onClick={() => setIsSelectionMode(true)} variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4 mr-2" /> Gestionar Flota
                </Button>
              ) : (
                <>
                  <Button onClick={handleSelectAll} variant="secondary" className="font-bold border-2 border-primary/20">
                    {selectedIds.length === filteredImages.length ? "Deseleccionar Todo" : "Seleccionar Todo"}
                  </Button>
                  <Button onClick={handleDeleteSelected} disabled={selectedIds.length === 0 || isDeleting} className="bg-red-600 text-white font-bold px-6">
                    {isDeleting ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-2 w-4 h-4" />} Borrar ({selectedIds.length})
                  </Button>
                  <Button onClick={() => { setIsSelectionMode(false); setSelectedIds([]) }} variant="ghost" className="hover:text-white">Cancelar</Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* --- FILTROS --- */}
        <div className="flex justify-center gap-4 flex-wrap mb-12">
          <button onClick={() => setFilter({ stage: "TODOS", subcategory: null })} className={`px-6 py-2 rounded border-2 transition-all font-bold ${filter.stage === "TODOS" ? "bg-primary text-black border-primary" : "border-primary/20 hover:border-primary/50"}`}>TODOS</button>
          {filtros.map(p => (
            <div key={p.id} className="relative" onMouseEnter={() => setHoveredStage(p.nombre)} onMouseLeave={() => setHoveredStage(null)}>
              <button onClick={() => setFilter({ stage: p.nombre, subcategory: null })} className={`px-6 py-2 rounded border-2 flex items-center gap-2 font-bold transition-all ${filter.stage === p.nombre ? "bg-primary text-black border-primary" : "border-primary/20 hover:border-primary/50"}`}>
                {p.nombre} {p.filtros_hijo.length > 0 && <ChevronDown className="w-4 h-4" />}
              </button>
              {hoveredStage === p.nombre && p.filtros_hijo.length > 0 && (
                <div className="absolute top-full left-0 pt-2 w-56 z-50">
                  <div className="bg-black border-2 border-primary/30 rounded overflow-hidden shadow-2xl backdrop-blur-md">
                    {p.filtros_hijo.map(h => (
                      <button key={h.id} onClick={() => setFilter({ stage: p.nombre, subcategory: h.nombre })} className="w-full text-left px-5 py-3 hover:bg-primary/20 text-sm font-medium border-b border-primary/10 last:border-b-0 transition-colors">{h.nombre}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {loading ? (
            <div className="col-span-full flex flex-col items-center py-20"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>
          ) : filteredImages.length > 0 ? (
            filteredImages.map((img, idx) => {
              const isSel = selectedIds.includes(img.id)
              return (
                <div key={img.id} onClick={() => isSelectionMode ? setSelectedIds(prev => prev.includes(img.id) ? prev.filter(i => i !== img.id) : [...prev, img.id]) : setSelectedImage(idx)}
                  className={`group relative aspect-video overflow-hidden rounded border-2 transition-all cursor-pointer ${isSel ? "border-primary ring-4 ring-primary/20 scale-[0.98]" : "border-primary/10 hover:border-primary"}`}>
                  
                  <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />

                  {img.fijada && <div className="absolute top-3 left-3 bg-primary text-black p-1.5 rounded-md shadow-lg z-10 animate-in fade-in zoom-in"><Pin className="w-4 h-4 fill-black" /></div>}

                  {userRole === 'admin' && !isSelectionMode && (
                    <button onClick={(e) => toggleFijar(e, img.id, img.fijada)} className="absolute top-3 right-3 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary z-20">
                      {img.fijada ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                    </button>
                  )}

                  {isSelectionMode && (
                    <div className="absolute top-4 right-4 z-20">{isSel ? <CheckCircle2 className="w-8 h-8 text-primary fill-black" /> : <Circle className="w-8 h-8 text-white/50" />}</div>
                  )}

                  {!isSelectionMode && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mb-1">{img.stage} {img.subcategory && `// ${img.subcategory}`}</p>
                      <p className="text-white text-sm font-medium truncate">{img.alt || "Sin descripción"}</p>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center py-24 border-2 border-dashed border-primary/10 rounded-lg"><p className="text-white/20 uppercase tracking-[0.4em]">Sector sin registros</p></div>
          )}
        </div>

        {/* --- MODAL SUBIDA (Input de archivo corregido) --- */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <div className="bg-black border-2 border-primary/30 rounded-lg p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-primary uppercase tracking-tighter">Cargar Evidencia</h2>
                <button onClick={() => setShowUploadModal(false)}><X className="w-6 h-6 hover:text-primary" /></button>
              </div>
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-primary/60 uppercase ml-1">Descripción</label>
                  <input type="text" placeholder="Título de la captura..." className="w-full bg-zinc-900 border-2 border-primary/20 p-3 rounded text-sm outline-none focus:border-primary transition-all" onChange={e => setUploadData({...uploadData, alt: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-primary/60 uppercase ml-1">Etapa</label>
                    <select className="w-full bg-zinc-900 border-2 border-primary/20 p-3 rounded text-xs outline-none focus:border-primary cursor-pointer" onChange={e => {
                      const p = filtros.find(f => f.id === e.target.value)
                      setUploadData({...uploadData, padreId: e.target.value, hijoId: p?.filtros_hijo[0]?.id || ""})
                    }}>
                      {filtros.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-primary/60 uppercase ml-1">Subcategoría</label>
                    <select className="w-full bg-zinc-900 border-2 border-primary/20 p-3 rounded text-xs outline-none focus:border-primary cursor-pointer" value={uploadData.hijoId} onChange={e => setUploadData({...uploadData, hijoId: e.target.value})}>
                      {filtros.find(f => f.id === uploadData.padreId)?.filtros_hijo.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary/60 uppercase ml-1">Archivo de imagen</label>
                  <input type="file" id="file-upload" accept="image/*" className="hidden" onChange={e => e.target.files && setUploadData({...uploadData, file: e.target.files[0]})} />
                  <label htmlFor="file-upload" className="flex items-center justify-between w-full bg-zinc-900 border-2 border-dashed border-primary/20 hover:border-primary/50 rounded-lg px-4 py-4 cursor-pointer transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded group-hover:bg-primary/20"><Upload className="w-5 h-5 text-primary" /></div>
                      <span className="text-sm text-zinc-400 truncate max-w-[180px]">{uploadData.file ? uploadData.file.name : "Seleccionar..."}</span>
                    </div>
                    {uploadData.file && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </label>
                </div>

                <Button onClick={handleUploadSubmit} disabled={!uploadData.file || isUploading} className="w-full bg-primary text-black font-black py-7 uppercase tracking-[0.2em] mt-2">
                  {isUploading ? <Loader2 className="animate-spin" /> : "Confirmar Transmisión"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- LIGHTBOX --- */}
        {selectedImage !== null && !isSelectionMode && (
          <div className="fixed inset-0 bg-black/98 z-[120] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image src={filteredImages[selectedImage].src} alt="View" width={1920} height={1080} className="object-contain max-h-full w-auto shadow-2xl" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-6 py-2 rounded-full border border-primary/20 backdrop-blur-md">
                <p className="text-primary font-bold text-sm tracking-widest uppercase">{filteredImages[selectedImage].alt || "Captura de Outraiders"}</p>
              </div>
            </div>
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"><X className="w-12 h-12" /></button>
          </div>
        )}
      </div>
    </main>
  )
}