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

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8 ml-auto mr-8">
          {isLandingPage && (
            <>
              <button onClick={() => scrollToSection("about")} className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide whitespace-nowrap uppercase">QUIÉNES SOMOS</button>
              <button onClick={() => scrollToSection("media")} className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide whitespace-nowrap uppercase">CONTENIDO</button>
            </>
          )}
          <Link href="/gallery" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide uppercase">GALERÍA</Link>
          <Link href="/public-comms" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium tracking-wide whitespace-nowrap uppercase">PUBLIC COMMS</Link>
        </div>

        {/* ACCIONES DERECHA (Switch + Auth + Hamburguesa) */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* SWITCH DIVISION */}
          <div className={`flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-full border border-white/20 backdrop-blur-sm transition-all duration-500 ${
              isIndustrial ? "bg-cyan-950/40 border-cyan-500/30" : "bg-red-950/40 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {isIndustrial ? <Factory className="w-3.5 h-3.5 text-primary animate-pulse" /> : <Target className="w-3.5 h-3.5 text-primary" />}
              <Label htmlFor="division-mode" className="hidden lg:block text-[10px] md:text-xs font-bold uppercase tracking-tighter cursor-pointer select-none">
                {isIndustrial ? 'Industrial' : 'PVP'}
              </Label>
            </div>
            <Switch 
              id="division-mode"
              checked={isIndustrial}
              onCheckedChange={(checked) => setDivision(checked ? 'INDUSTRIAL' : 'PVP')}
              className="scale-75 md:scale-100 data-[state=checked]:bg-primary data-[state=unchecked]:bg-red-600 transition-colors"
            />
          </div>

          {/* AUTH SECTION (DESKTOP) */}
          {!loading && (
            <div className="hidden md:flex items-center border-l border-white/10 pl-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center hover:opacity-80 transition-opacity focus:outline-none shrink-0">
                      <div className="relative w-8 h-8 md:w-9 md:h-9">
                        <Image src={avatarUrl} alt={displayName} fill className="rounded-full border-2 border-primary object-cover" />
                      </div>
                      <span className="hidden lg:inline ml-2 text-sm font-bold text-white tracking-tight">{displayName}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white">
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
                <Button onClick={login} className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold h-9 px-4 text-xs flex items-center gap-2">
                  LOGIN <Image src="/discord-logo.png" alt="Discord" width={14} height={14} />
                </Button>
              )}
            </div>
          )}

          {/* BOTÓN HAMBURGUESA (MÓVIL) */}
          <button
            className="md:hidden p-2 text-white hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
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
            
            <hr className="border-white/10" />

            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Image src={avatarUrl} alt={displayName} width={40} height={40} className="rounded-full border border-primary" />
                  <span className="font-bold text-white">{displayName}</span>
                </div>
                <Button onClick={goToProfile} variant="outline" className="justify-start border-zinc-700 text-white">
                  <User className="mr-2 h-4 w-4" /> Perfil
                </Button>
                <Button onClick={logout} variant="destructive" className="justify-start">
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Button onClick={login} className="bg-[#5865F2] hover:bg-[#4752C4] w-full font-bold py-6 text-base gap-3">
                LOGIN CON DISCORD <Image src="/discord-logo.png" alt="Discord" width={20} height={20} />
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}