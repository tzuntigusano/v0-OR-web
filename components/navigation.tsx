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
import { useDiscordAuth } from "@/hooks/use-discord-auth"
import { LogOut, User } from "lucide-react"

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const { user, loading, login, logout, getAvatarUrl } = useDiscordAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

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
              <Image src="/discord-logo.png" alt="Discord" width={20} height={20} className="mr-2 inline-block" />
            </a>
          </Button>

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Image
                        src={getAvatarUrl(user) || "/placeholder.svg"}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-primary"
                      />
                      <span className="text-sm font-medium text-foreground">{user.global_name || user.username}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.global_name || user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.username}#{user.discriminator}
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
                    className="mr-2 inline-block" // Cambiado ml-2 por mr-2 para que el margen sea interno
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
