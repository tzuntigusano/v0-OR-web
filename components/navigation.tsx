"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import Link from "next/link"
import { LogOut, User } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)

    const checkUser = async () => {
      // 1. Obtenemos el objeto completo 'data'
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Error al obtener sesión:", error.message)
      } else if (data && data.session) {
        // 2. Aquí accedemos a la sesión de forma segura
        setUser(data.session.user)
      }
      setLoading(false)
    }

    checkUser()

    // Escuchamos cambios (cuando el usuario vuelve de Discord)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setUser(currentSession?.user ?? null)
      setLoading(false)
    })

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    // No hace falta recargar, el onAuthStateChange detectará que user es null
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

 // 1. Extraemos los metadatos para no repetir tanto código
  const meta = user?.user_metadata;

  // 2. Definición robusta
  const avatarUrl = meta?.avatar_url || meta?.picture || "/placeholder.svg";

  // Buscamos el nombre de visualización (Global Name)
  const displayName = 
    meta?.global_name ||              // Caso más común en Discord moderno
    meta?.custom_claims?.global_name || // A veces Supabase lo mueve aquí
    meta?.display_name ||             // Algunos providers lo llaman así
    "Usuario";
  
  const handle = meta?.name || "discord_user"
  const secondName = meta?.full_name
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md border-b-2 border-primary/20" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/outraiders-logoanagrama-w.png"
            alt="Outraiders Icon"
            width={48}
            height={48}
            className="object-contain h-12 w-12"
            priority
          />
          <Image
            src="/images/outraiders-anagrama-1-recortado.png"
            alt="Outraiders Logo"
            width={200}
            height={40}
            className="brightness-0 invert object-contain h-6 w-auto"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("about")}
            className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide"
          >
            QUIÉNES SOMOS
          </button>
          <Link
            href="/gallery"
            className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide"
          >
            GALERÍA
          </Link>
          <button
            onClick={() => scrollToSection("media")}
            className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide"
          >
            CONTENIDO
          </button>
          
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide"
          >
            <a href="https://google.es" target="_blank" rel="noopener noreferrer" className="flex items-center">
              ÚNETE
              <Image src="/discord-logo.png" alt="Discord" width={20} height={20} className="ml-2 inline-block" />
            </a>
          </Button>

          {!loading && (
            <div className="ml-4 border-l border-white/10 pl-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none">
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={36}
                        height={36}
                        className="rounded-full border-2 border-primary object-cover"
                      />
                      <div className="flex flex-col items-start justify-center leading-tight">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {displayName}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{secondName}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer focus:bg-zinc-800 focus:text-white">
                      <User className="mr-2 h-4 w-4 text-primary" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={logout} 
                      className="text-red-500 hover:bg-red-500/10 cursor-pointer focus:bg-red-500/10 focus:text-red-500"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={login}
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold tracking-wide flex items-center gap-2 px-6"
                >
                  LOGIN
                  <Image src="/discord-logo.png" alt="Discord" width={18} height={18} />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}