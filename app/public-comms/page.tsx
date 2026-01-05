"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Loader2, Calendar, ImageIcon } from "lucide-react"
import Image from "next/image"

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

const MOCK_MESSAGES: DiscordMessage[] = [
  {
    id: "1",
    author: {
      username: "CommanderAlex",
      avatar: "/space-pilot-avatar.jpg",
    },
    content:
      "¡Misión completada con éxito! El convoy llegó sano y salvo a Port Olisar. Excelente trabajo equipo, la coordinación fue impecable.",
    timestamp: "2025-01-15T18:30:00Z",
    attachments: [
      {
        url: "/star-citizen-convoy-mission.jpg",
        filename: "convoy-mission-complete.jpg",
      },
    ],
  },
  {
    id: "2",
    author: {
      username: "PilotSara",
      avatar: "/female-space-pilot.jpg",
    },
    content:
      "Próxima operación de minería programada para mañana a las 20:00 UTC. Necesitamos al menos 3 naves de escolta y 2 equipos de minería. ¿Quién se apunta?",
    timestamp: "2025-01-15T16:45:00Z",
  },
  {
    id: "3",
    author: {
      username: "TechOfficerMike",
      avatar: "/tech-specialist-avatar.jpg",
    },
    content:
      "Recordatorio: Esta noche tenemos práctica de combate en Arena Commander. Es importante que todos los pilotos nuevos asistan para mejorar sus habilidades de vuelo.",
    timestamp: "2025-01-15T14:20:00Z",
  },
  {
    id: "4",
    author: {
      username: "NavigatorJohn",
      avatar: "/navigator-pilot-avatar.jpg",
    },
    content:
      "He actualizado las rutas comerciales en el sistema Stanton. Los precios en Lorville están muy bien para vender minerales ahora mismo. Aprovechen antes de que cambien.",
    timestamp: "2025-01-15T12:10:00Z",
    attachments: [
      {
        url: "/star-citizen-trading-route-map.jpg",
        filename: "trade-routes-stanton.png",
      },
    ],
  },
  {
    id: "5",
    author: {
      username: "SecurityChief",
      avatar: "/security-officer-avatar.jpg",
    },
    content:
      "Alerta: Se reportó actividad pirata cerca de Crusader. Todos los pilotos deben viajar en formación y mantener comunicaciones abiertas.",
    timestamp: "2025-01-15T10:05:00Z",
  },
  {
    id: "6",
    author: {
      username: "EngineersClub",
      avatar: "/engineer-avatar.png",
    },
    content:
      "¡Nueva actualización del hangar! Ahora podemos reparar y modificar naves medianas. El taller está abierto 24/7 para todos los miembros.",
    timestamp: "2025-01-15T08:30:00Z",
  },
]

export default function PublicCommsPage() {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<DiscordMessage[]>([])

  useEffect(() => {
    // TODO: Reemplazar con fetch real a Discord API
    // Ejemplo de llamada:
    // fetch('https://discord.com/api/v10/channels/YOUR_CHANNEL_ID/messages', {
    //   headers: {
    //     'Authorization': 'Bot YOUR_BOT_TOKEN'
    //   }
    // })
    // .then(res => res.json())
    // .then(data => {
    //   setMessages(data);
    //   setLoading(false);
    // });

    const timer = setTimeout(() => {
      setMessages(MOCK_MESSAGES)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
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
    <main className="relative min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-wider">
              PUBLIC <span className="text-primary">COMMS</span>
            </h1>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
              Mantente informado con las últimas comunicaciones de la organización. Todas las actualizaciones, misiones
              y anuncios importantes en un solo lugar.
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-foreground/70 font-medium tracking-wide">Cargando comunicaciones...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className="bg-card border border-border rounded-lg p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                >
                  {/* Author Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                      <Image
                        src={message.author.avatar || "/placeholder.svg"}
                        alt={message.author.username}
                        width={48}
                        height={48}
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

                  {/* Message Content */}
                  <div className="text-foreground/80 leading-relaxed text-base mb-4 pl-16">{message.content}</div>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="pl-16 space-y-3">
                      {message.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="relative rounded-lg overflow-hidden border border-border group cursor-pointer"
                        >
                          <div className="relative aspect-video w-full">
                            <Image
                              src={attachment.url || "/placeholder.svg"}
                              alt={attachment.filename}
                              width={600}
                              height={400}
                              className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <div className="flex items-center gap-2 text-white text-sm">
                              <ImageIcon className="w-4 h-4" />
                              <span className="truncate">{attachment.filename}</span>
                            </div>
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
            <p className="text-foreground/60 mb-6 text-sm tracking-wide">¿Quieres participar en las conversaciones?</p>
            <a
              href="https://discord.gg/YOUR_INVITE_LINK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-primary/50"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              Únete a Discord
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
