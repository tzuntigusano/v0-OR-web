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
import { usePathname } from "next/navigation"
import { LogOut, User, Menu, X } from "lucide-react" // Añadidos Menu y X
import { supabase } from "@/lib/supabase"

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false) // Estado para el menú móvil
  const pathname = usePathname()

  const isLandingPage = pathname === "/"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)

    const checkUser = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Error al obtener sesión:", error.message)
      } else if (data && data.session) {
        setUser(data.session.user)
      }
      setLoading(false)
    }

    checkUser()

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
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setMobileMenuOpen(false) // Cierra el menú al navegar
    }
  }

  const meta = user?.user_metadata
  const avatarUrl = meta?.avatar_url || meta?.picture || "/placeholder.svg"
  const displayName = 
    meta?.global_name || 
    meta?.custom_claims?.global_name || 
    meta?.display_name || 
    "Usuario"
  
  const secondName = meta?.full_name

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen ? "bg-black/80 backdrop-blur-md border-b-2 border-primary/20" : "bg-transparent"
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

        {/* MENU ESCRITORIO */}
        <div className="hidden md:flex items-center gap-8">
          {isLandingPage && (
            <>
              <button
                onClick={() => scrollToSection("about")}
                className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide"
              >
                QUIÉNES SOMOS
              </button>

              <button
                onClick={() => scrollToSection("media")}
                className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide"
              >
                CONTENIDO
              </button>
            </>
          )}

          <Link
            href="/gallery"
            className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide"
          >
            GALERÍA
          </Link>
          
          <Link
            href="/public-comms"
            className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide"
          >
            PUBLIC COMMS
          </Link>
        </div>

        {/* ACCIONES (Siempre visibles) */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide h-9 px-3 md:h-10 md:px-4 text-xs md:text-sm"
          >
            <a href="https://google.es" target="_blank" rel="noopener noreferrer" className="flex items-center">
              ÚNETE
              <Image src="/discord-logo.png" alt="Discord" width={16} height={16} className="ml-1 md:ml-2 inline-block" />
            </a>
          </Button>

          {!loading && (
            <div className="md:border-l md:border-white/10 md:pl-4">
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
                      {/* El nombre se oculta solo en móvil (hidden md:block) */}
                      <div className="hidden md:flex flex-col items-start justify-center leading-tight">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {displayName}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{secondName || displayName}</p>
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
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold tracking-wide flex items-center gap-2 h-9 px-3 md:h-10 md:px-6 text-xs md:text-sm"
                >
                  LOGIN
                  <Image src="/discord-logo.png" alt="Discord" width={16} height={16} />
                </Button>
              )}
            </div>
          )}

          {/* Botón Hamburguesa (Solo Móvil) */}
          <button 
            className="md:hidden text-primary p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* DESPLEGABLE MÓVIL (Solo Secciones) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-b-2 border-primary/20 flex flex-col p-6 gap-6 animate-in slide-in-from-top duration-300">
          {isLandingPage && (
            <>
              <button onClick={() => scrollToSection("about")} className="text-left text-lg font-bold uppercase italic text-white hover:text-primary">QUIÉNES SOMOS</button>
              <button onClick={() => scrollToSection("media")} className="text-left text-lg font-bold uppercase italic text-white hover:text-primary">CONTENIDO</button>
            </>
          )}
          <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase italic text-white hover:text-primary">GALERÍA</Link>
          <Link href="/public-comms" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase italic text-white hover:text-primary">PUBLIC COMMS</Link>
        </div>
      )}
    </nav>
  )
}