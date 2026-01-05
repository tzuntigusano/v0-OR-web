"use client"

import { useState, useEffect } from "react"

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  global_name?: string
}

export function useDiscordAuth() {
  const [user, setUser] = useState<DiscordUser | null>(null)
  const [loading, setLoading] = useState(true)

  const DISCORD_CLIENT_ID = "1457484621888360680"
  const REDIRECT_URI = "https://v0-outraiders-sc.vercel.app/"
  const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get("access_token")

      if (accessToken) {
        // Guardar token en localStorage
        localStorage.setItem("discord_token", accessToken)

        // Limpiar el hash de la URL
        window.history.replaceState(null, "", window.location.pathname)

        // Obtener información del usuario
        fetchDiscordUser(accessToken)
      }
    } else {
      // Verificar si hay un token guardado
      const savedToken = localStorage.getItem("discord_token")
      if (savedToken) {
        fetchDiscordUser(savedToken)
      } else {
        setLoading(false)
      }
    }
  }, [])

  const fetchDiscordUser = async (token: string) => {
    try {
      const response = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem("discord_user", JSON.stringify(userData))
      } else {
        // Tdoken inválido o expirado
        localStorage.removeItem("discord_token")
        localStorage.removeItem("discord_user")
      }
    } catch (error) {
      console.error("Error fetching Discord user:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    window.location.href = DISCORD_AUTH_URL
  }

  const logout = () => {
    localStorage.removeItem("discord_token")
    localStorage.removeItem("discord_user")
    setUser(null)
  }

  const getAvatarUrl = (user: DiscordUser) => {
    if (user.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    }
    return `https://cdn.discordapp.com/embed/avatars/${Number.parseInt(user.discriminator) % 5}.png`
  }

  return {
    user,
    loading,
    login,
    logout,
    getAvatarUrl,
  }
}
