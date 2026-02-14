"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  Rocket, Shield, Target, Award, Zap, Calendar, Hash, Activity, Star, ChevronRight 
} from "lucide-react"

// --- CONFIGURACIÓN DE ICONOS PARA ESPECIALIDADES ---
// Para que sea dinámico, mapeamos el nombre que viene del back con un icono.
const ICON_MAP: Record<string, React.ReactNode> = {
  "Pilot": <Rocket className="w-4 h-4 text-cyan-400" />,
  "Capital Ship Pilot": <Shield className="w-4 h-4 text-purple-400" />,
  "Soldier": <Target className="w-4 h-4 text-red-400" />,
  "Wing Commander": <Award className="w-4 h-4 text-yellow-400" />,
  // Si viene una especialidad nueva sin icono, usaremos uno por defecto (Activity)
}

// --- DATOS MOCK (Esto es lo que vendría de tu API) ---
const MOCK_DATA = {
  rango: "Raider Elite",
  puntosPorActividad: [
    { label: "Flotas", valor: 450 },
    { label: "Entrenamientos", valor: 200 },
    { label: "Operaciones", valor: 850 },
    { label: "Eventos", valor: 150 },
    { label: "Endgame", valor: 300 }
  ],
  especialidades: [
    { nombre: "Pilot", tier: "T3", puntos: 1200 },
    { nombre: "Capital Ship Pilot", tier: "T1", puntos: 400 },
    { nombre: "Soldier", tier: "T2", puntos: 800 },
    { nombre: "Wing Commander", tier: "T1", puntos: 100 }
  ],
  historial: [
    { fecha: "2026-02-14", id: "OP-122", actividad: "Operación", especialidad: "Pilot", puntos: 50 },
    { fecha: "2026-02-12", id: "FL-045", actividad: "Flota", especialidad: "Soldier", puntos: 20 },
    { fecha: "2026-02-10", id: "EN-012", actividad: "Entrenamiento", especialidad: "Pilot", puntos: 30 },
    { fecha: "2026-02-08", id: "EV-001", actividad: "Evento", especialidad: "Wing Commander", puntos: 100 }
  ]
}

export function ProfileViewer({ user }: { user: any }) {
  const [filtro, setFiltro] = useState("General")
  
  const meta = user?.user_metadata
  const avatarUrl = meta?.avatar_url || "/placeholder.svg"
  const displayName = meta?.global_name || meta?.display_name || "Usuario"

  // 1. Chips Dinámicas: Extraemos las actividades únicas del historial para los filtros
  const categoriasFiltro = ["General", ...Array.from(new Set(MOCK_DATA.historial.map(h => h.actividad)))]

  // 2. Lógica de Filtrado Dinámica
  const historialFiltrado = MOCK_DATA.historial
    .filter(item => filtro === "General" || item.actividad === filtro)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* COLUMNA IZQUIERDA (4 de 12) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* HEADER USUARIO */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <Image src={avatarUrl} alt={displayName} fill className="rounded-full border-2 border-primary object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{displayName}</h2>
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{MOCK_DATA.rango}</p>
          </div>
        </div>

        {/* TABLA DINÁMICA: PUNTOS ACTIVIDAD */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Puntos por Actividad</span>
          </div>
          <div className="divide-y divide-zinc-900">
            {MOCK_DATA.puntosPorActividad.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 hover:bg-white/[0.02] transition-colors">
                <span className="text-sm text-zinc-400">{item.label}</span>
                <span className="text-sm font-mono font-bold text-white">{item.valor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* TABLA DINÁMICA: ESPECIALIDADES */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Especialidades</span>
          </div>
          <table className="w-full">
            <thead className="text-[9px] uppercase text-zinc-500 bg-zinc-900/20">
              <tr>
                <th className="text-left p-4 font-medium">Especialidad</th>
                <th className="text-center p-4 font-medium">Tier</th>
                <th className="text-right p-4 font-medium">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm">
              {MOCK_DATA.especialidades.map((esp, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 rounded-lg">
                      {ICON_MAP[esp.nombre] || <Activity className="w-4 h-4 text-zinc-500" />}
                    </div>
                    <span className="font-semibold text-zinc-200">{esp.nombre}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-bold">{esp.tier}</span>
                  </td>
                  <td className="p-4 text-right font-mono text-primary font-bold">{esp.puntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COLUMNA DERECHA (8 de 12) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* FILTROS (CHIPS) DINÁMICOS */}
        <div className="flex flex-wrap gap-2">
          {categoriasFiltro.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                filtro === cat 
                ? "bg-primary border-primary text-black" 
                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"
              }`}
            >
              {cat === "General" ? "Actividad General" : cat}
            </button>
          ))}
        </div>

        {/* TABLA PRINCIPAL DINÁMICA */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-[9px] uppercase text-zinc-500 bg-zinc-900/50">
              <tr>
                <th className="p-4 font-bold border-b border-zinc-800">Fecha</th>
                <th className="p-4 font-bold border-b border-zinc-800">ID</th>
                <th className="p-4 font-bold border-b border-zinc-800">Actividad</th>
                <th className="p-4 font-bold border-b border-zinc-800">Especialidad</th>
                <th className="p-4 font-bold border-b border-zinc-800 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {historialFiltrado.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-4 text-zinc-500 font-mono text-xs">{row.fecha}</td>
                  <td className="p-4 text-zinc-200 font-bold">{row.id}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-zinc-900 text-zinc-400 rounded text-[10px] border border-zinc-800 group-hover:border-primary/50 transition-colors">
                      {row.actividad}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400 text-sm">{row.especialidad}</td>
                  <td className="p-4 text-right">
                    <span className="font-mono font-bold text-primary">+{row.puntos}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {historialFiltrado.length === 0 && (
            <div className="p-20 text-center text-zinc-700 uppercase text-[10px] tracking-[0.3em]">
              Sin registros en esta categoría
            </div>
          )}
        </div>
      </div>
    </div>
  )
}