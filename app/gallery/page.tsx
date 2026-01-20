"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { X, Upload, ChevronDown, Loader2, Trash2, CheckCircle2, Circle, Pin, PinOff, Files, Save, Edit3 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import imageCompression from 'browser-image-compression'

// --- Interfaces ---
interface FiltroPadre {
  id: string
  nombre: string
  filtros_hijo: { id: string; nombre: string; orden: number }[]
}

interface GaleriaImagen {
  id: string
  src: string
  alt: string
  stage: string
  subcategory: string | null
  fijada: boolean
  filtro_padre_id: string
  filtro_hijo_id: string | null
}

export default function GalleryPage() {
  // --- ESTADOS ---
  const [filtros, setFiltros] = useState<FiltroPadre[]>([])
  const [images, setImages] = useState<GaleriaImagen[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [userRole, setUserRole] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingNames, setIsSavingNames] = useState(false)
  const [editedNames, setEditedNames] = useState<{ [key: string]: string }>({}) 
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const [filter, setFilter] = useState<{ stage: string; subcategory: string | null; padreId?: string; hijoId?: string | null }>({ 
    stage: "TODOS", 
    subcategory: null 
  })
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false)
  const [uploadData, setUploadData] = useState({ padreId: "", hijoId: "", alt: "", files: [] as File[] })

  // --- 1. FUNCIÓN DE CARGA OPTIMIZADA (CON ABORT SIGNAL) ---
  const fetchImages = useCallback(async (padreId?: string, hijoId?: string | null, signal?: AbortSignal) => {
    try {
      setLoading(true);
      console.log("📸 [FETCH] Iniciando carga de imágenes...");
      
      let data;
      let error;

      if (!padreId || padreId === "TODOS") {
        // Nota: supabase.rpc no acepta signal directamente en todas las versiones, 
        // pero se ejecuta rápido. Para mayor seguridad, las queries .from sí lo usan.
        const res = await supabase.rpc('get_random_images', { limit_count: 40 });
        data = res.data;
        error = res.error;
      } else {
        let query = supabase.from('imagenes_galeria').select(`
          id, url, alt, fijada, filtro_padre_id, filtro_hijo_id,
          filtros_padre (nombre), filtros_hijo (nombre)
        `);

        // Aplicamos el signal para abortar la petición si se refresca la página
        if (signal) query = query.abortSignal(signal);

        if (hijoId) query = query.eq('filtro_padre_id', padreId).eq('filtro_hijo_id', hijoId);
        else query = query.eq('filtro_padre_id', padreId);
        
        const res = await query.order('fijada', { ascending: false }).order('created_at', { ascending: false });
        data = res.data;
        error = res.error;
      }

      if (error) throw error;

      if (data) {
        setImages(data.map((img: any) => ({
          id: img.id,
          src: img.url,
          alt: img.alt || "",
          fijada: img.fijada || false,
          stage: img.filtros_padre?.nombre || "",
          subcategory: img.filtros_hijo?.nombre || null,
          filtro_padre_id: img.filtro_padre_id,
          filtro_hijo_id: img.filtro_hijo_id
        })));
        console.log("✅ [FETCH] Éxito");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log("X [FETCH] Petición cancelada por el sistema");
      } else {
        console.error("❌ [FETCH FATAL ERROR]:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // --- 2. EFECTO INICIAL (CON CONTROLADOR DE ABORTO Y LIMPIEZA) ---
  // --- 2. EFECTO DE CARGA DE DATOS ---
  useEffect(() => {
    const controller = new AbortController();
    
    const init = async () => {
      console.log("🚀 [INIT] Iniciando carga de datos...");
      try {
        // Cargamos filtros e imágenes en paralelo para mayor velocidad
        await Promise.all([
          supabase
            .from('filtros_padre')
            .select(`id, nombre, filtros_hijo (id, nombre, orden)`)
            .abortSignal(controller.signal)
            .order('orden', { ascending: true })
            .then(({ data: fData }) => {
              if (fData) {
                const lista = fData.filter(f => f.nombre.toUpperCase() !== "TODOS");
                setFiltros(lista);
              }
            }),
          fetchImages(undefined, undefined, controller.signal)
        ]);
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error("Error en init:", err);
      }
    };

    init();

    return () => {
      console.log("🧹 [CLEANUP] Abortando peticiones de datos...");
      controller.abort();
    };
  }, [fetchImages]);

  // --- 3. EFECTO DE AUTENTICACIÓN (SEPARADO) ---
  useEffect(() => {
    console.log("🔐 [AUTH] Configurando escucha de sesión...");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (controller.signal.aborted) return; // Si ya refrescamos, no hagas nada
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        setUserRole(data?.role || null);
      } else {
        setUserRole(null);
      }
    });

    return () => {
      console.log("🧹 [CLEANUP] Cerrando suscripción Auth...");
      subscription.unsubscribe();
    };
  }, []);

  // --- 3. FUNCIONES DRAG & DROP ---
  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if ((userRole === 'admin' || userRole === 'editor') && !isSelectionMode) setIsDraggingGlobal(true);
  };

  const handleGlobalDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.currentTarget === e.target) setIsDraggingGlobal(false);
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingGlobal(false);
    if ((userRole === 'admin' || userRole === 'editor') && !isSelectionMode) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        setUploadData(prev => ({ ...prev, files: [...prev.files, ...droppedFiles] }));
        setShowUploadModal(true);
      }
    }
  };

  // --- 4. ACCIONES ADMIN ---
  const toggleFijar = async (e: React.MouseEvent, img: any) => {
    e.stopPropagation();
    try {
      if (!img.fijada) {
        let q = supabase.from('imagenes_galeria').update({ fijada: false }).eq('filtro_padre_id', img.filtro_padre_id).eq('fijada', true);
        if (img.filtro_hijo_id) q = q.eq('filtro_hijo_id', img.filtro_hijo_id);
        else q = q.is('filtro_hijo_id', null);
        await q;
      }
      await supabase.from('imagenes_galeria').update({ fijada: !img.fijada }).eq('id', img.id);
      fetchImages(filter.padreId, filter.hijoId);
    } catch (err) { console.error(err); }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || !confirm(`¿Borrar ${selectedIds.length}?`)) return;
    setIsDeleting(true);
    try {
      const { data: toDel } = await supabase.from('imagenes_galeria').select('url').in('id', selectedIds);
      if (toDel) await supabase.storage.from('galeria').remove(toDel.map(i => i.url.split('/galeria/')[1]));
      await supabase.from('imagenes_galeria').delete().in('id', selectedIds);
      setSelectedIds([]); setIsSelectionMode(false); fetchImages(filter.padreId, filter.hijoId);
    } finally { setIsDeleting(false); }
  };

  const handleSaveAllChanges = async () => {
    setIsSavingNames(true);
    try {
      for (const [id, alt] of Object.entries(editedNames)) {
        await supabase.from('imagenes_galeria').update({ alt: alt.trim() }).eq('id', id);
      }
      setEditedNames({}); setIsSelectionMode(false); fetchImages(filter.padreId, filter.hijoId);
    } finally { setIsSavingNames(false); }
  };

  const handleUploadSubmit = async () => {
    if (uploadData.files.length === 0 || !user) return;
    setIsUploading(true);
    setUploadProgress({ current: 0, total: uploadData.files.length });
    try {
      for (let i = 0; i < uploadData.files.length; i++) {
        setUploadProgress(p => ({ ...p, current: i + 1 }));
        const comp = await imageCompression(uploadData.files[i], { maxSizeMB: 0.8, maxWidthOrHeight: 1920 });
        const path = `${user.id}/${Date.now()}_${i}`;
        await supabase.storage.from('galeria').upload(path, comp);
        const { data: { publicUrl } } = supabase.storage.from('galeria').getPublicUrl(path);
        await supabase.from('imagenes_galeria').insert([{
          url: publicUrl, alt: uploadData.alt, 
          filtro_padre_id: uploadData.padreId, filtro_hijo_id: uploadData.hijoId || null, subido_por: user.id
        }]);
      }
      setUploadData(p => ({ ...p, files: [], alt: "" })); setShowUploadModal(false);
      fetchImages(filter.padreId, filter.hijoId);
    } finally { setIsUploading(false); }
  };

  const isAdmin = userRole === 'admin' || userRole === 'editor';

  return (
    <main 
      className="min-h-screen bg-background text-foreground relative"
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      <Navigation />

      {isDraggingGlobal && (
        <div className="fixed inset-0 z-[200] bg-primary/20 backdrop-blur-md border-[6px] border-dashed border-primary flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 p-10 rounded-3xl border-2 border-primary flex flex-col items-center gap-6">
            <Upload className="w-20 h-20 text-primary animate-bounce" />
            <h2 className="text-3xl font-black text-primary uppercase italic">Soltar archivos</h2>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-center text-4xl md:text-6xl font-bold mb-12 uppercase italic">Galería <span className="text-primary">Outraiders</span></h1>

        <div className="flex flex-col items-center gap-4 mb-12">
          {isAdmin && !isSelectionMode && (
            <Button onClick={() => setShowUploadModal(true)} className="bg-primary text-black font-bold px-8 py-6 text-lg uppercase">
              <Files className="mr-2 w-6 h-6" /> Subir Imagen
            </Button>
          )}
          {userRole === 'admin' && (
            <div className="flex flex-wrap justify-center gap-3">
              {!isSelectionMode ? (
                <Button onClick={() => setIsSelectionMode(true)} variant="outline" className="text-red-500 border-red-500/50">Gestionar</Button>
              ) : (
                <>
                  <Button onClick={() => setSelectedIds(selectedIds.length === images.length ? [] : images.map(i => i.id))} variant="secondary">Seleccionar Todo</Button>
                  {Object.keys(editedNames).length > 0 && <Button onClick={handleSaveAllChanges} className="bg-emerald-600">{isSavingNames ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4"/>} Guardar</Button>}
                  <Button onClick={handleDeleteSelected} disabled={selectedIds.length === 0} className="bg-red-600">Borrar ({selectedIds.length})</Button>
                  <Button onClick={() => { setIsSelectionMode(false); setSelectedIds([]); setEditedNames({}); }} variant="ghost">Cancelar</Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* --- FILTROS --- */}
        <div className="flex justify-center gap-4 flex-wrap mb-12">
          <button onClick={() => { setFilter({ stage: "TODOS", subcategory: null }); fetchImages(); }} 
            className={`px-6 py-2 rounded border-2 font-bold ${filter.stage === "TODOS" ? "bg-primary text-black border-primary" : "border-primary/20"}`}>
            TODOS
          </button>
          {filtros.map(p => (
            <div key={p.id} className="relative" onMouseEnter={() => setHoveredStage(p.nombre)} onMouseLeave={() => setHoveredStage(null)}>
              <button onClick={() => { setFilter({ stage: p.nombre, subcategory: null, padreId: p.id }); fetchImages(p.id); }} 
                className={`px-6 py-2 rounded border-2 flex items-center gap-2 font-bold ${filter.stage === p.nombre ? "bg-primary text-black border-primary" : "border-primary/20"}`}>
                {p.nombre} {p.filtros_hijo.length > 0 && <ChevronDown className="w-4 h-4" />}
              </button>
              {hoveredStage === p.nombre && p.filtros_hijo.length > 0 && (
                <div className="absolute top-full left-0 pt-2 w-56 z-50">
                  <div className="bg-black border-2 border-primary/30 rounded overflow-hidden">
                    {p.filtros_hijo.map(h => (
                      <button key={h.id} onClick={() => { setFilter({ stage: p.nombre, subcategory: h.nombre, padreId: p.id, hijoId: h.id }); fetchImages(p.id, h.id); }} 
                        className="w-full text-left px-5 py-3 hover:bg-primary/20 text-sm border-b border-primary/10 last:border-b-0">
                        {h.nombre}
                      </button>
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
            <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>
          ) : images.length > 0 ? (
            images.map((img, idx) => {
              const isSel = selectedIds.includes(img.id);
              return (
                <div key={img.id} 
                  onClick={() => isSelectionMode ? setSelectedIds(prev => prev.includes(img.id) ? prev.filter(i => i !== img.id) : [...prev, img.id]) : setSelectedImage(idx)}
                  className={`group relative aspect-video overflow-hidden rounded border-2 transition-all ${isSel ? "border-primary ring-4 ring-primary/20" : "border-primary/10 hover:border-primary"}`}>
                  <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform group-hover:scale-105" />
                  
                  {img.fijada && isAdmin && filter.subcategory !== null && <div className="absolute top-3 left-3 bg-primary text-black p-1 rounded z-10"><Pin className="w-4 h-4 fill-black" /></div>}
                  {isAdmin && !isSelectionMode && filter.subcategory !== null && (
                    <button onClick={(e) => toggleFijar(e, img)} className="absolute top-3 right-3 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary z-20">
                      {img.fijada ? <PinOff className="h-5 w-5"/> : <Pin className="h-5 w-5"/>}
                    </button>
                  )}
                  {isSelectionMode && <div className="absolute top-4 right-4 z-20">{isSel ? <CheckCircle2 className="w-8 h-8 text-primary fill-black" /> : <Circle className="w-8 h-8 text-white/50" />}</div>}

                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-5 transition-opacity ${isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <p className="text-[10px] font-bold text-primary uppercase">{img.stage} {img.subcategory && `// ${img.subcategory}`}</p>
                    {isSelectionMode ? (
                      <input type="text" value={editedNames[img.id] ?? img.alt} onClick={e => e.stopPropagation()} onChange={e => setEditedNames({...editedNames, [img.id]: e.target.value})}
                        className="w-full bg-white/10 border border-primary/30 rounded px-2 py-1 text-sm text-white" />
                    ) : (
                      img.alt && <p className="text-white text-sm font-medium truncate">{img.alt}</p>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center py-24 border-2 border-dashed border-primary/10 rounded-lg text-white/20 uppercase">Sector sin registros</div>
          )}
        </div>

        {/* --- MODAL SUBIDA --- */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
            <div className="bg-black border-2 border-primary/30 rounded-lg p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary uppercase italic">Carga de Flota</h2>
                <button onClick={() => setShowUploadModal(false)}><X className="w-6 h-6 hover:text-primary" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-primary/60 uppercase ml-1">Etapa</label>
                    <select className="w-full bg-zinc-900 border-2 border-primary/20 p-3 rounded text-xs text-white" value={uploadData.padreId} onChange={e => {
                      const p = filtros.find(f => f.id === e.target.value);
                      setUploadData({...uploadData, padreId: e.target.value, hijoId: p?.filtros_hijo[0]?.id || ""});
                    }}>
                      {filtros.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-primary/60 uppercase ml-1">Subcategoría</label>
                    <select className="w-full bg-zinc-900 border-2 border-primary/20 p-3 rounded text-xs text-white" value={uploadData.hijoId} onChange={e => setUploadData({...uploadData, hijoId: e.target.value})}>
                      {filtros.find(f => f.id === uploadData.padreId)?.filtros_hijo.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <input type="text" value={uploadData.alt} onChange={e => setUploadData({...uploadData, alt: e.target.value})} className="w-full bg-zinc-900 border-2 border-primary/20 p-3 rounded text-white" placeholder="Descripción opcional" />
                <input type="file" id="file-up" accept="image/*" multiple className="hidden" onChange={e => e.target.files && setUploadData({...uploadData, files: Array.from(e.target.files)})} />
                <label htmlFor="file-up" className="flex flex-col items-center justify-center w-full bg-zinc-900 border-2 border-dashed border-primary/20 rounded-lg p-8 cursor-pointer">
                  <Upload className="w-8 h-8 text-primary/40 mb-2" />
                  <span className="text-sm text-zinc-400">{uploadData.files.length > 0 ? `${uploadData.files.length} archivos` : "Arrastra o clica"}</span>
                </label>
                <Button onClick={handleUploadSubmit} disabled={uploadData.files.length === 0 || isUploading} className="w-full bg-primary text-black font-black py-7 uppercase">
                  {isUploading ? `TRANSMITIENDO ${uploadProgress.current}/${uploadProgress.total}` : "Confirmar Transmisión"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* --- VISOR --- */}
        {selectedImage !== null && !isSelectionMode && (
          <div className="fixed inset-0 bg-black/98 z-[400] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image src={images[selectedImage].src} alt="View" width={1920} height={1080} className="object-contain max-h-full w-auto" />
              {images[selectedImage].alt && <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/80 px-8 py-3 rounded-full border border-primary/30 text-primary font-bold uppercase italic">{images[selectedImage].alt}</div>}
            </div>
            <button className="absolute top-8 right-8 text-white/50 hover:text-white"><X className="w-12 h-12" /></button>
          </div>
        )}
      </div>
    </main>
  );
}