"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Loader2, Calendar, ImageIcon, AlertCircle, ChevronDown } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase" // Asegúrate de tener exportado 'supabase' en lib/supabase

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

interface DiscordMessage {
  id: string
  author: {
    username: string
    avatar: string
  }
  content: string
  timestamp: string
  attachments?: {
    url: string
    filename: string
  }[]
}

export default function PublicCommsPage() {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<DiscordMessage[]>([])
  const [filtros, setFiltros] = useState<FiltroPadre[]>([]) // Estado para los filtros de Supabase
  const [activeFilter, setActiveFilter] = useState("TODOS")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 1. Cargar Filtros de Supabase
        const { data: filtrosData, error: dbError } = await supabase
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

        if (dbError) throw dbError;
        setFiltros(filtrosData || []);

        // 2. Cargar Mensajes de Discord (Tu API interna)
        const response = await fetch("/api/discord")
        if (!response.ok) throw new Error("No se pudieron cargar las comunicaciones")
        const data = await response.json()
        setMessages(data)

      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Hace unos minutos"
    if (diffInHours < 24) return `Hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`
    if (diffInHours < 48) return "Ayer"

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-wider">
              PUBLIC <span className="text-primary">COMMS</span>
            </h1>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
              Gestión de flota y comunicaciones del centro de mando.
            </p>
          </div>

          {/* --- SECCIÓN DE FILTROS DINÁMICOS --- */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {/* Botón Siempre Fijo: TODOS */}
            <button
              onClick={() => setActiveFilter("TODOS")}
              className={`px-4 py-2 rounded-md transition-all border ${
                activeFilter === "TODOS" 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-transparent border-border hover:border-primary/50"
              }`}
            >
              TODOS
            </button>

            {/* Mapeo de Filtros desde Supabase */}
            {filtros.map((padre) => {
              const tieneHijos = padre.filtros_hijo && padre.filtros_hijo.length > 0;

              if (!tieneHijos) {
                return (
                  <button
                    key={padre.id}
                    onClick={() => setActiveFilter(padre.nombre)}
                    className={`px-4 py-2 rounded-md transition-all border ${
                      activeFilter === padre.nombre 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-transparent border-border hover:border-primary/50"
                    }`}
                  >
                    {padre.nombre}
                  </button>
                );
              }

              // Si tiene hijos, renderiza el desplegable (Lógica Hover con Tailwind 'group')
              return (
                <div key={padre.id} className="relative group">
                  <button className="px-4 py-2 rounded-md border border-border flex items-center gap-2 group-hover:border-primary/50 transition-all">
                    {padre.nombre}
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>

                  {/* Menú Desplegable */}
                  <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 min-w-[160px] bg-card border border-border rounded-lg shadow-xl overflow-hidden">
                    {padre.filtros_hijo.map((hijo) => (
                      <button
                        key={hijo.id}
                        onClick={() => setActiveFilter(hijo.nombre)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {hijo.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-3 p-4 mb-8 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-foreground/70 font-medium tracking-wide">Sincronizando sistemas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.length === 0 && !error && (
                <p className="text-center text-foreground/50">No hay registros disponibles.</p>
              )}
              
              {/* Aquí podrías filtrar los mensajes si tuvieran una propiedad que coincida con activeFilter */}
              {messages.map((message) => (
                <article
                  key={message.id}
                  className="bg-card border border-border rounded-lg p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                      <Image
                        src={message.author.avatar}
                        alt={message.author.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-foreground font-bold text-lg tracking-wide">{message.author.username}</h3>
                      <div className="flex items-center gap-2 text-foreground/50 text-sm">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={message.timestamp}>{formatDate(message.timestamp)}</time>
                      </div>
                    </div>
                  </div>

                  <div className="text-foreground/80 leading-relaxed text-base mb-4 md:pl-16">
                    {message.content || <span className="italic opacity-50 text-sm">Contenido multimedia únicamente</span>}
                  </div>

                  {message.attachments && message.attachments.length > 0 && (
                    <div className="md:pl-16 space-y-3">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden border border-border group cursor-pointer">
                          <div className="relative aspect-video w-full max-w-2xl">
                            <Image
                              src={attachment.url}
                              alt={attachment.filename}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 text-center border-t border-border pt-12">
            <p className="text-foreground/60 mb-6 text-sm tracking-wide">¿Consultas sobre la flota?</p>
            <a
              href="https://discord.gg/TU_LINK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-primary/50"
            >
              Acceder al Roster
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}