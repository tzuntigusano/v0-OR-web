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
// Importamos el cliente que creamos nosotros en la carpeta lib
import { supabase } from "@/lib/supabase"

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    // Comprobar sesión actual
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    checkUser()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      subscription.unsubscribe()
    }
  }, [])

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) console.error("Error al loguear:", error.message)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const userMetadata = user?.user_metadata

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
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Image
                        src={userMetadata?.avatar_url || "/placeholder.svg"}
                        alt={userMetadata?.full_name || "Usuario"}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-primary"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {userMetadata?.full_name || userMetadata?.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userMetadata?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          @{userMetadata?.name}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={login}
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold tracking-wide flex items-center gap-2"
                >
                  LOGIN
                  <Image 
                    src="/discord-logo.png" 
                    alt="Discord" 
                    width={20} 
                    height={20} 
                    className="ml-2 inline-block" 
                  />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}