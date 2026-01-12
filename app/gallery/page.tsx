"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { X, Upload, ChevronDown, Loader2, Trash2, CheckCircle2, Circle, Pin, PinOff } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import imageCompression from 'browser-image-compression'

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
  const [filtros, setFiltros] = useState<FiltroPadre[]>([])
  const [images, setImages] = useState<GaleriaImagen[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  // Estados de Gestión
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const [filter, setFilter] = useState<{ stage: string; subcategory: string | null }>({ stage: "TODOS", subcategory: null })
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({ padreId: "", hijoId: "", alt: "", file: null as File | null })

  // 1. CARGA DE DATOS (Ordenado por fijada DESC, luego fecha DESC)
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
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      const { data: fData } = await supabase.from('filtros_padre').select(`id, nombre, filtros_hijo (id, nombre)`).order('orden', { ascending: true })
      if (fData) setFiltros(fData.filter(f => f.nombre.toUpperCase() !== "TODOS"))
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

  // 2. LÓGICA DE FILTRADO
  const filteredImages = filter.stage === "TODOS"
    ? images
    : filter.subcategory
      ? images.filter((img) => img.stage === filter.stage && img.subcategory === filter.subcategory)
      : images.filter((img) => img.stage === filter.stage)

  // 3. ACCIONES DE GESTIÓN
  const handleSelectAll = () => {
    if (selectedIds.length === filteredImages.length) setSelectedIds([])
    else setSelectedIds(filteredImages.map(img => img.id))
  }

  const toggleFijar = async (e: React.MouseEvent, imgId: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
      // Primero quitamos el fijado de CUALQUIER otra imagen (solo puede haber una)
      if (!currentStatus) {
        await supabase.from('imagenes_galeria').update({ fijada: false }).neq('id', imgId)
      }
      
      const { error } = await supabase
        .from('imagenes_galeria')
        .update({ fijada: !currentStatus })
        .eq('id', imgId)
      
      if (error) throw error
      await fetchImages()
    } catch (err) { alert("Error al fijar imagen") }
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
      setShowUploadModal(false); await fetchImages()
    } finally { setIsUploading(false) }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-center text-4xl md:text-6xl font-bold mb-12 uppercase">Galería <span className="text-primary">Outraiders</span></h1>

        {/* --- PANEL ADMIN --- */}
        <div className="flex flex-col items-center gap-4 mb-12">
          {(userRole === 'admin' || userRole === 'editor') && !isSelectionMode && (
            <Button onClick={() => setShowUploadModal(true)} className="bg-primary text-black font-bold px-8 py-6 text-lg uppercase tracking-tighter">
              <Upload className="mr-2" /> Subir Imagen
            </Button>
          )}

          {userRole === 'admin' && (
            <div className="flex flex-wrap justify-center gap-2">
              {!isSelectionMode ? (
                <Button onClick={() => setIsSelectionMode(true)} variant="outline" className="border-red-500/50 text-red-500">
                  <Trash2 className="w-4 h-4 mr-2" /> Gestionar Galería
                </Button>
              ) : (
                <>
                  <Button onClick={handleSelectAll} variant="secondary" className="font-bold">
                    {selectedIds.length === filteredImages.length ? "Deseleccionar Todo" : "Seleccionar Todo"}
                  </Button>
                  <Button onClick={handleDeleteSelected} disabled={selectedIds.length === 0 || isDeleting} className="bg-red-600 text-white font-bold">
                    {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 className="mr-2" />} Borrar ({selectedIds.length})
                  </Button>
                  <Button onClick={() => { setIsSelectionMode(false); setSelectedIds([]) }} variant="ghost">Cancelar</Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* --- FILTROS --- */}
        <div className="flex justify-center gap-4 flex-wrap mb-12">
          <button onClick={() => setFilter({ stage: "TODOS", subcategory: null })} className={`px-6 py-2 rounded border-2 ${filter.stage === "TODOS" ? "bg-primary text-black border-primary" : "border-primary/20"}`}>TODOS</button>
          {filtros.map(p => (
            <div key={p.id} className="relative" onMouseEnter={() => setHoveredStage(p.nombre)} onMouseLeave={() => setHoveredStage(null)}>
              <button onClick={() => setFilter({ stage: p.nombre, subcategory: null })} className={`px-6 py-2 rounded border-2 flex items-center gap-2 ${filter.stage === p.nombre ? "bg-primary text-black border-primary" : "border-primary/20"}`}>
                {p.nombre} {p.filtros_hijo.length > 0 && <ChevronDown className="w-4 h-4" />}
              </button>
              {hoveredStage === p.nombre && p.filtros_hijo.length > 0 && (
                <div className="absolute top-full left-0 pt-2 w-48 z-50">
                  <div className="bg-black border border-primary/30 rounded shadow-xl">
                    {p.filtros_hijo.map(h => (
                      <button key={h.id} onClick={() => setFilter({ stage: p.nombre, subcategory: h.nombre })} className="w-full text-left px-4 py-2 hover:bg-primary/20 text-sm">{h.nombre}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredImages.map((img, idx) => {
            const isSel = selectedIds.includes(img.id)
            return (
              <div key={img.id} onClick={() => isSelectionMode ? setSelectedIds(prev => prev.includes(img.id) ? prev.filter(i => i !== img.id) : [...prev, img.id]) : setSelectedImage(idx)}
                className={`group relative aspect-video overflow-hidden rounded border-2 transition-all cursor-pointer ${isSel ? "border-primary ring-4 ring-primary/20" : "border-primary/10 hover:border-primary"}`}>
                
                <Image src={img.src} alt={img.alt} fill className="object-cover" />

                {/* Badge de Fijada */}
                {img.fijada && <div className="absolute top-2 left-2 bg-primary text-black p-1 rounded shadow-lg z-10"><Pin className="w-4 h-4" /></div>}

                {/* Botón de Fijar (Solo Admin) */}
                {userRole === 'admin' && !isSelectionMode && (
                  <button onClick={(e) => toggleFijar(e, img.id, img.fijada)} className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
                    {img.fijada ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                  </button>
                )}

                {/* Checks Selección */}
                {isSelectionMode && (
                  <div className="absolute top-3 right-3">{isSel ? <CheckCircle2 className="w-8 h-8 text-primary fill-black" /> : <Circle className="w-8 h-8 text-white/50" />}</div>
                )}
              </div>
            )
          })}
        </div>

        {/* --- MODAL SUBIDA --- */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <div className="bg-black border-2 border-primary/30 rounded-lg p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-primary mb-4 uppercase">Nueva Evidencia</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Descripción..." className="w-full bg-zinc-900 border border-primary/20 p-3 rounded text-sm outline-none focus:border-primary" onChange={e => setUploadData({...uploadData, alt: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="bg-zinc-900 border border-primary/20 p-2 rounded text-xs" onChange={e => {
                    const p = filtros.find(f => f.id === e.target.value)
                    setUploadData({...uploadData, padreId: e.target.value, hijoId: p?.filtros_hijo[0]?.id || ""})
                  }}>
                    {filtros.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                  </select>
                  <select className="bg-zinc-900 border border-primary/20 p-2 rounded text-xs" onChange={e => setUploadData({...uploadData, hijoId: e.target.value})}>
                    {filtros.find(f => f.id === uploadData.padreId)?.filtros_hijo.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                  </select>
                </div>
                <input type="file" accept="image/*" className="text-xs" onChange={e => e.target.files && setUploadData({...uploadData, file: e.target.files[0]})} />
                <Button onClick={handleUploadSubmit} disabled={!uploadData.file || isUploading} className="w-full bg-primary text-black font-bold uppercase">{isUploading ? <Loader2 className="animate-spin" /> : "Transmitir"}</Button>
              </div>
            </div>
          </div>
        )}

        {/* --- LIGHTBOX --- */}
        {selectedImage !== null && !isSelectionMode && (
          <div className="fixed inset-0 bg-black/98 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <Image src={filteredImages[selectedImage].src} alt="View" width={1920} height={1080} className="object-contain max-h-full" />
            <button className="absolute top-10 right-10 text-white"><X className="w-10 h-10" /></button>
          </div>
        )}
      </div>
    </main>
  )
}