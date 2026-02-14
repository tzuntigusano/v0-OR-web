"use client"

import { Navigation } from "@/components/navigation"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Esto hace que aparezca la cabecera */}
      <Navigation />

      {/* El contenido de la página con un margen superior para que no lo tape la cabecera */}
      <div className="container mx-auto pt-32 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary uppercase tracking-tighter mb-2">
            Mi Perfil
          </h1>
          <p className="text-zinc-500 font-medium">
            Bienvenido a tu panel de usuario de Outraiders.
          </p>
          
          <div className="mt-12 p-8 border border-zinc-800 bg-zinc-900/30 rounded-2xl backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">Próximamente</h2>
            <p className="text-zinc-400">
              Aquí aparecerán tus estadísticas, logros y configuración de cuenta.
            </p>
            <div className="mt-6 h-1 w-24 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  )
}