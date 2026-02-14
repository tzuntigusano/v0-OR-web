"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, User, Menu, X, Factory, Target } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useDivision } from "@/context/DivisionContext"

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  const { isIndustrial, setDivision } = useDivision()

  const isLandingPage = pathname === "/"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
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
    setMobileMenuOpen(false)
  }

  const goToProfile = () => {
    setMobileMenuOpen(false)
    router.push("/profile")
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
  const displayName = meta?.global_name || meta?.custom_claims?.global_name || meta?.display_name || "Usuario"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 ${
        scrolled || mobileMenuOpen ? "bg-black/95 backdrop-blur-md border-b-2 border-primary/20" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2 md:gap-4">
        
        {/* IZQUIERDA: LOGO */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0" onClick={() => setMobileMenuOpen(false)}>
          <Image
            src="/images/outraiders-logoanagrama-w.png"
            alt="Outraiders Icon"
            width={40}
            height={40}
            className="object-contain h-8 w-8 md:h-12 md:w-12"
            priority
          />
          <Image
            src="/images/outraiders-anagrama-1-recortado.png"
            alt="Outraiders Logo"
            width={180}
            height={36}
            className="brightness-0 invert object-contain h-5 w-auto hidden lg:block"
            priority
          />
        </Link>

        {/* CENTRO: DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-auto mr-4">
          {isLandingPage && (
            <>
              <button onClick={() => scrollToSection("about")} className="text-foreground/80 hover:text-primary transition-colors text-xs lg:text-sm font-medium tracking-wide uppercase">QUIÉNES SOMOS</button>
              <button onClick={() => scrollToSection("media")} className="text-foreground/80 hover:text-primary transition-colors text-xs lg:text-sm font-medium tracking-wide uppercase">CONTENIDO</button>
            </>
          )}
          <Link href="/gallery" className="text-foreground/80 hover:text-primary transition-colors text-xs lg:text-sm font-medium tracking-wide uppercase">GALERÍA</Link>
          <Link href="/public-comms" className="text-foreground/80 hover:text-primary transition-colors text-xs lg:text-sm font-medium tracking-wide uppercase">PUBLIC COMMS</Link>
        </div>

        {/* DERECHA: ACCIONES COMBINADAS */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* SWITCH DIVISION (Visible en todos los tamaños) */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10 backdrop-blur-sm transition-all duration-500 ${
              isIndustrial ? "bg-cyan-950/30 border-cyan-500/20" : "bg-red-950/30 border-red-500/20"
            }`}
          >
            {isIndustrial ? <Factory className="w-3 h-3 text-primary animate-pulse" /> : <Target className="w-3 h-3 text-primary" />}
            <Switch 
              id="division-mode"
              checked={isIndustrial}
              onCheckedChange={(checked) => setDivision(checked ? 'INDUSTRIAL' : 'PVP')}
              className="scale-75 data-[state=checked]:bg-primary data-[state=unchecked]:bg-red-600"
            />
          </div>

          {/* BOTÓN ÚNETE (Visible siempre, más pequeño en móvil) */}
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-8 px-2 md:h-9 md:px-4 text-[10px] md:text-xs shrink-0"
          >
            <a href="https://google.es" target="_blank" rel="noopener noreferrer" className="flex items-center">
              <span className="hidden sm:inline">ÚNETE</span>
              <Image src="/discord-logo.png" alt="Discord" width={14} height={14} className="sm:ml-2" />
            </a>
          </Button>

          {/* AUTH (LOGIN O PERFIL) */}
          {!loading && (
            <div className="flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center hover:opacity-80 transition-opacity focus:outline-none shrink-0">
                      <div className="relative w-8 h-8 md:w-9 md:h-9">
                        <Image src={avatarUrl} alt={displayName} fill className="rounded-full border-2 border-primary object-cover" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white z-[110]">
                    <DropdownMenuItem onClick={goToProfile} className="hover:bg-zinc-800 cursor-pointer">
                      <User className="mr-2 h-4 w-4 text-primary" />
                      <span>Perfil ({displayName})</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-red-500 hover:bg-red-500/10 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={login} className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold h-8 px-2 md:h-9 md:px-4 text-[10px] md:text-xs flex items-center gap-1 md:gap-2">
                  LOGIN <Image src="/discord-logo.png" alt="Discord" width={12} height={12} className="hidden md:block" />
                </Button>
              )}
            </div>
          )}

          {/* BOTÓN HAMBURGUESA (Extremo derecho) */}
          <button
            className="md:hidden p-1.5 text-white hover:text-primary transition-colors shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE (Solo links de navegación) */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-primary/20 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col p-6 gap-6">
            {isLandingPage && (
              <>
                <button onClick={() => scrollToSection("about")} className="text-left text-base font-bold uppercase tracking-wider text-white hover:text-primary transition-colors">QUIÉNES SOMOS</button>
                <button onClick={() => scrollToSection("media")} className="text-left text-base font-bold uppercase tracking-wider text-white hover:text-primary transition-colors">CONTENIDO</button>
              </>
            )}
            <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-white hover:text-primary transition-colors">GALERÍA</Link>
            <Link href="/public-comms" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-white hover:text-primary transition-colors">PUBLIC COMMS</Link>
          </div>
        </div>
      )}
    </nav>
  )
}