"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ProfileViewer } from "@/components/profile-viewer" // <-- Importamos el nuevo módulo
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

    // Escuchar cambios de autenticación para actualizar el perfil en tiempo real
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Cabecera siempre visible */}
      <Navigation />

      <div className="container mx-auto pt-32 pb-20 px-4">
        {loading ? (
          /* Estado de carga profesional */
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 uppercase text-xs tracking-[0.3em] animate-pulse">
              Sincronizando datos de Raider...
            </p>
          </div>
        ) : user ? (
          /* SI HAY USUARIO: Mostramos el módulo dinámico */
          <div className="max-w-7xl mx-auto">
             <ProfileViewer user={user} />
          </div>
        ) : (
          /* SI NO HAY USUARIO: Mensaje de error o redirección */
          <div className="text-center p-20 border border-zinc-800 rounded-3xl bg-zinc-900/20">
            <h2 className="text-2xl font-bold text-red-500 uppercase mb-4">Acceso Denegado</h2>
            <p className="text-zinc-400">Debes estar logueado para ver tu perfil de Outraiders.</p>
          </div>
        )}
      </div>
    </main>
  )
}