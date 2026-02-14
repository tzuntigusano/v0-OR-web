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
        scrolled || mobileMenuOpen ? "bg-black/90 backdrop-blur-md border-b-2 border-primary/20" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 shrink-0" onClick={() => setMobileMenuOpen(false)}>
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

        <div className="flex items-center gap-4 md:gap-8 ml-auto">
          {/* DESKTOP NAV */}
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

          {/* SWITCH DIVISION */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-500 ${
              isIndustrial ? "bg-cyan-950/40 border-cyan-500/30" : "bg-red-950/40 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isIndustrial ? (
                <Factory className="w-3.5 h-3.5 text-primary animate-pulse" />
              ) : (
                <Target className="w-3.5 h-3.5 text-primary" />
              )}
              <Label htmlFor="division-mode" className="hidden md:block text-[10px] md:text-xs font-bold uppercase tracking-tighter cursor-pointer select-none">
                {isIndustrial ? 'Industrial' : 'PVP'}
              </Label>
            </div>
            <Switch 
              id="division-mode"
              checked={isIndustrial}
              onCheckedChange={(checked) => setDivision(checked ? 'INDUSTRIAL' : 'PVP')}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-red-600 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* BOTÓN ÚNETE */}
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide h-8 px-2 md:h-10 md:px-4 text-[10px] md:text-sm shrink-0 transition-colors duration-500"
            >
              <a href="https://google.es" target="_blank" rel="noopener noreferrer" className="flex items-center">
                ÚNETE
                <Image src="/discord-logo.png" alt="Discord" width={14} height={14} className="ml-1 md:ml-2" />
              </a>
            </Button>

            {/* LOGIN O FOTO DE PERFIL */}
            {!loading && (
              <div className="md:border-l md:border-white/10 md:pl-4 flex items-center gap-2">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center hover:opacity-80 transition-opacity focus:outline-none shrink-0">
                        <div className="relative w-8 h-8 md:w-9 md:h-9">
                          <Image
                            src={avatarUrl}
                            alt={displayName}
                            fill
                            className="rounded-full border-2 border-primary object-cover transition-colors duration-500"
                          />
                        </div>
                        <div className="hidden md:flex flex-col items-start ml-2 leading-tight text-left">
                          <span className="text-sm font-bold text-white tracking-tight">{displayName}</span>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white">
                      {/* ACCESO AL PERFIL RESTAURADO */}
                      <DropdownMenuItem onClick={goToProfile} className="hover:bg-zinc-800 cursor-pointer focus:bg-zinc-800 focus:text-white">
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
                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold h-8 px-2 md:h-10 md:px-6 text-[10px] md:text-sm shrink-0 flex items-center gap-2"
                  >
                    LOGIN
                    <Image src="/discord-logo.png" alt="Discord" width={14} height={14} />
                  </Button>
                )}
                
                {/* BOTÓN HAMBURGUESA MÓVIL */}
                <button
                  className="md:hidden p-2 text-white hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-primary/20 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col p-6 gap-6">
            {isLandingPage && (
              <>
                <button onClick={() => scrollToSection("about")} className="text-left text-lg font-bold uppercase tracking-wider text-white hover:text-primary transition-colors">QUIÉNES SOMOS</button>
                <button onClick={() => scrollToSection("media")} className="text-left text-lg font-bold uppercase tracking-wider text-white hover:text-primary transition-colors">CONTENIDO</button>
              </>
            )}
            <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-wider text-white hover:text-primary transition-colors">GALERÍA</Link>
            <Link href="/public-comms" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold uppercase tracking-wider text-white hover:text-primary transition-colors">PUBLIC COMMS</Link>
          </div>
        </div>
      )}
    </nav>
  )
}