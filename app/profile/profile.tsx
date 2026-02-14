"use client"

import { Navigation } from "@/components/navigation"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="container mx-auto pt-32 px-4 text-center">
        <h1 className="text-3xl font-bold text-primary uppercase">Profile Viewer</h1>
        <p className="text-zinc-500 mt-4 font-mono">Contenido en desarrollo...</p>
      </div>
    </main>
  )
}