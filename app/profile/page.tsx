"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ProfileViewer } from "@/components/profile-viewer"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        setUser(data.session.user)
      }
      setLoading(false)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    /* CAMBIO CLAVE: bg-black -> bg-background y añadimos transition para suavidad */
    <main className="min-h-screen bg-background text-white transition-colors duration-700">
      {/* Cabecera siempre visible */}
      <Navigation />

      <div className="container mx-auto pt-32 pb-20 px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 uppercase text-xs tracking-[0.3em] animate-pulse">
              Sincronizando datos de Raider...
            </p>
          </div>
        ) : user ? (
          <div className="max-w-7xl mx-auto">
             <ProfileViewer user={user} />
          </div>
        ) : (
          <div className="text-center p-20 border border-zinc-800 rounded-3xl bg-card/20">
            <h2 className="text-2xl font-bold text-red-500 uppercase mb-4">Acceso Denegado</h2>
            <p className="text-zinc-400">Debes estar logueado para ver tu perfil de Outraiders.</p>
          </div>
        )}
      </div>
    </main>
  )
}