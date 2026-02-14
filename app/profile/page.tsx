"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { 
  Rocket, Shield, Target, Award, Zap, Calendar, Hash, Activity, Star, Plus
} from "lucide-react"

const ICON_MAP: Record<string, React.ReactNode> = {
  "Pilot": <Rocket className="w-4 h-4 text-cyan-400" />,
  "Capital Ship Pilot": <Shield className="w-4 h-4 text-purple-400" />,
  "Soldier": <Target className="w-4 h-4 text-red-400" />,
  "Wing Commander": <Award className="w-4 h-4 text-yellow-400" />,
}

// Lógica de colores para Tiers
const getTierStyle = (tier: string) => {
  switch(tier) {
    case "T3": return "bg-orange-500/20 text-orange-500 border-orange-500/50"; // Máximo
    case "T2": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    case "T1": return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    case "T0": return "bg-zinc-700/50 text-zinc-400 border-zinc-600"; // Mínimo
    default: return "bg-zinc-800 text-zinc-400";
  }
}

// --- GENERACIÓN DE DATOS EXTENSOS PARA PRUEBAS ---
const generateMockHistory = () => {
  const actividades = ["Operación", "Flota", "Entrenamiento", "Evento"];
  const especialidades = ["Pilot", "Soldier", "Capital Ship Pilot", "Wing Commander"];
  
  return Array.from({ length: 45 }, (_, i) => ({
    fecha: new Date(2026, 1, 14 - i).toISOString().split('T')[0],
    id: Math.floor(Math.random() * 100) + 1,
    actividad: actividades[Math.floor(Math.random() * actividades.length)],
    especialidad: especialidades[Math.floor(Math.random() * especialidades.length)],
    dkps: Math.floor(Math.random() * 150) + 10,
  }));
}

const MOCK_DATA = {
  rango: "Raider Elite",
  dkpsPorActividad: [
    { label: "Flotas", valor: 450 },
    { label: "Entrenamientos", valor: 200 },
    { label: "Operaciones", valor: 850 },
    { label: "Eventos", valor: 150 },
    { label: "Endgame", valor: 300 }
  ],
  especialidades: [
    { nombre: "Pilot", tier: "T3", dkps: 1200 },
    { nombre: "Capital Ship Pilot", tier: "T1", dkps: 400 },
    { nombre: "Soldier", tier: "T2", dkps: 800 },
    { nombre: "Wing Commander", tier: "T0", dkps: 50 },
  ],
  historial: generateMockHistory()
}

export function ProfileViewer({ user }: { user: any }) {
  const [filtro, setFiltro] = useState("General")
  const [itemsAMostrar, setItemsAMostrar] = useState(10) // Paginación inicial
  
  const meta = user?.user_metadata
  const avatarUrl = meta?.avatar_url || "/placeholder.svg"
  const displayName = meta?.global_name || meta?.display_name || "Usuario"

  const categoriasFiltro = ["General", "Flota", "Operación", "Entrenamiento", "Evento"]

  // Filtrado y ordenación
  const historialFiltrado = useMemo(() => {
    return MOCK_DATA.historial
      .filter(item => filtro === "General" || item.actividad === filtro)
  }, [filtro])

  const datosVisibles = historialFiltrado.slice(0, itemsAMostrar)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* COLUMNA IZQUIERDA */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center gap-4">
          <Image src={avatarUrl} alt={displayName} width={64} height={64} className="rounded-full border-2 border-primary" />
          <div>
            <h2 className="text-xl font-bold text-white uppercase">{displayName}</h2>
            <p className="text-primary text-[10px] font-bold tracking-widest uppercase">{MOCK_DATA.rango}</p>
          </div>
        </div>

        {/* DKPs por Actividad */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">DKPs por Actividad</span>
          </div>
          <div className="divide-y divide-zinc-900">
            {MOCK_DATA.dkpsPorActividad.map((item, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-2.5 hover:bg-white/[0.02]">
                <span className="text-xs text-zinc-400">{item.label}</span>
                <span className="text-xs font-mono font-bold text-white">{item.valor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Especialidades */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">Especialidades</span>
          </div>
          <table className="w-full text-xs">
            <thead className="text-[8px] uppercase text-zinc-500 bg-zinc-900/20">
              <tr>
                <th className="text-left p-3 font-medium">Especialidad</th>
                <th className="text-center p-3 font-medium">Tier</th>
                <th className="text-right p-3 font-medium">DKPs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {MOCK_DATA.especialidades.map((esp, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="p-3 flex items-center gap-2">
                    {ICON_MAP[esp.nombre] || <Activity className="w-3 h-3" />}
                    <span className="font-medium text-zinc-200">{esp.nombre}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getTierStyle(esp.tier)}`}>
                      {esp.tier}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-primary font-bold">{esp.dkps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {categoriasFiltro.map((cat) => (
            <button
              key={cat}
              onClick={() => { setFiltro(cat); setItemsAMostrar(10); }}
              className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all border ${
                filtro === cat ? "bg-primary border-primary text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500"
              }`}
            >
              {cat === "General" ? "Actividad General" : cat + "s"}
            </button>
          ))}
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="text-[9px] uppercase text-zinc-500 bg-zinc-900/50">
              <tr>
                <th className="px-4 py-2 font-bold border-b border-zinc-800">Fecha</th>
                <th className="px-4 py-2 font-bold border-b border-zinc-800">ID</th>
                <th className="px-4 py-2 font-bold border-b border-zinc-800">Actividad</th>
                <th className="px-4 py-2 font-bold border-b border-zinc-800">Especialidad</th>
                <th className="px-4 py-2 font-bold border-b border-zinc-800 text-right">DKPs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {datosVisibles.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-4 py-2 text-zinc-500 font-mono text-[10px]">{row.fecha}</td>
                  <td className="px-4 py-2 text-zinc-300 font-bold text-xs">#{row.id}</td>
                  <td className="px-4 py-2">
                    <span className="text-[10px] text-white uppercase">{row.actividad}</span>
                  </td>
                  <td className="px-4 py-2 text-zinc-400 text-xs">{row.especialidad}</td>
                  <td className="px-4 py-2 text-right">
                    <span className="font-mono font-bold text-primary text-xs">+{row.dkps}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* BOTÓN CARGAR MÁS */}
          {historialFiltrado.length > itemsAMostrar && (
            <div className="p-3 bg-zinc-900/30 flex justify-center border-t border-zinc-800">
              <button 
                onClick={() => setItemsAMostrar(prev => prev + 10)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
                Cargar más actividad
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}