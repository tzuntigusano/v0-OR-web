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
import { LogOut, User, Menu, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isLandingPage = pathname === "/"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) setUser(data.session.user)
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setMobileMenuOpen(false)
    }
  }

  const meta = user?.user_metadata
  const avatarUrl = meta?.avatar_url || meta?.picture || "/placeholder.svg"
  const displayName = meta?.global_name || meta?.display_name || "Usuario"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen ? "bg-black/80 backdrop-blur-md border-b-2 border-primary/20" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* LOGO E ICONO */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/images/outraiders-logoanagrama-w.png"
            alt="Outraiders Icon"
            width={48}
            height={48}
            className="object-contain h-10 w-10 md:h-12 md:w-12"
            priority
          />
          <Image
            src="/images/outraiders-anagrama-1-recortado.png"
            alt="Outraiders Logo"
            width={200}
            height={40}
            className="brightness-0 invert object-contain h-6 w-auto hidden lg:block"
            priority
          />
        </Link>

        {/* CONTENEDOR DERECHO: SECCIONES + BOTONES */}
        <div className="flex items-center gap-4 md:gap-8 ml-auto">
          {/* SECCIONES PC - Restaurada fuente original */}
          <div className="hidden md:flex items-center gap-8">
            {isLandingPage && (
              <>
                <button onClick={() => scrollToSection("about")} className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide whitespace-nowrap uppercase">QUIÉNES SOMOS</button>
                <button onClick={() => scrollToSection("media")} className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide whitespace-nowrap uppercase">CONTENIDO</button>
              </>
            )}
            <Link href="/gallery" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide uppercase">GALERÍA</Link>
            <Link href="/public-comms" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide whitespace-nowrap uppercase">PUBLIC COMMS</Link>
          </div>

          {/* BOTONES ACCIÓN */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide h-8 px-2 md:h-10 md:px-4 text-[10px] md:text-sm shrink-0"
            >
              <a href="https://google.es" target="_blank" rel="noopener noreferrer" className="flex items-center">
                ÚNETE
                <Image src="/discord-logo.png" alt="Discord" width={14} height={14} className="ml-1 md:ml-2" />
              </a>
            </Button>

            {!loading && (
              <div className="md:border-l md:border-white/10 md:pl-4 flex items-center">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center hover:opacity-80 transition-opacity focus:outline-none shrink-0">
                        <div className="relative w-8 h-8 md:w-9 md:h-9">
                          <Image
                            src={avatarUrl}
                            alt={displayName}
                            fill
                            className="rounded-full border-2 border-primary object-cover"
                          />
                        </div>
                        <div className="hidden md:flex flex-col items-start ml-2 leading-tight text-left">
                          <span className="text-sm font-bold text-white tracking-tight">{displayName}</span>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white">
                      <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer focus:bg-zinc-800 focus:text-white">
                        <User className="mr-2 h-4 w-4 text-primary" />
                        <span>Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout} className="text-red-500 hover:bg-red-500/10 cursor-pointer focus:bg-red-500/10 focus:text-red-500">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    onClick={login}
                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold h-8 px-2 md:h-10 md:px-6 text-[10px] md:text-sm shrink-0"
                  >
                    LOGIN
                  </Button>
                )}
              </div>
            )}

            <button 
              className="md:hidden text-primary p-1 shrink-0" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN - Ahora usa la misma fuente que PC */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-b-2 border-primary/20 flex flex-col p-6 gap-6 animate-in slide-in-from-top duration-300">
          {isLandingPage && (
            <>
              <button onClick={() => scrollToSection("about")} className="text-left text-sm font-medium tracking-wide uppercase text-white hover:text-primary">QUIÉNES SOMOS</button>
              <button onClick={() => scrollToSection("media")} className="text-left text-sm font-medium tracking-wide uppercase text-white hover:text-primary">CONTENIDO</button>
            </>
          )}
          <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium tracking-wide uppercase text-white hover:text-primary">GALERÍA</Link>
          <Link href="/public-comms" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium tracking-wide uppercase text-white hover:text-primary">PUBLIC COMMS</Link>
        </div>
      )}
    </nav>
  )
}