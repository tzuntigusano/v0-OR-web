"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { 
  Rocket, Shield, Target, Award, Zap, Star, Plus, ChevronUp, ChevronDown, Activity 
} from "lucide-react"

// --- TIPOS (Para que VSC no de error con "any") ---
interface SubSpecialty {
  nombre: string;
  tier: string;
  dkps: number;
}

interface Specialty {
  nombre: string;
  tier: string;
  dkps: number;
  sub: SubSpecialty[];
}

// --- CONFIGURACIÓN VISUAL ---
const ACTIVIDAD_STYLES: Record<string, string> = {
  "Operación": "bg-red-500/10 text-red-400 border-red-500/20",
  "Flota": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Entrenamiento": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Evento": "bg-amber-500/10 text-amber-400 border-amber-500/20",
}

const ICON_MAP: Record<string, React.ReactNode> = {
  "Pilot": <Rocket className="w-3.5 h-3.5 text-white" />,
  "Capital Ship Pilot": <Shield className="w-3.5 h-3.5 text-white" />,
  "Soldier": <Target className="w-3.5 h-3.5 text-white" />,
  "Wing Commander": <Award className="w-3.5 h-3.5 text-white" />,
}

const getTierStyle = (tier: string) => {
  switch(tier) {
    case "T3": return "bg-orange-500/20 text-orange-500 border-orange-500/50";
    case "T2": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    case "T1": return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    case "T0": return "bg-zinc-700/50 text-zinc-400 border-zinc-600";
    default: return "bg-zinc-800 text-zinc-400";
  }
}

// --- DATOS ---
const ESPECIALIDADES_DATA: Specialty[] = [
  { 
    nombre: "Pilot", tier: "T3", dkps: 1200,
    sub: [
      { nombre: "Dogfighter", tier: "T3", dkps: 600 },
      { nombre: "Flight Support", tier: "T2", dkps: 400 },
      { nombre: "Multicrew Fighter", tier: "T1", dkps: 200 },
    ]
  },
  { nombre: "Capital Ship Pilot", tier: "T1", dkps: 400, sub: [] },
  { 
    nombre: "Soldier", tier: "T2", dkps: 800,
    sub: [
      { nombre: "Medic", tier: "T1", dkps: 300 },
      { nombre: "Infiltrator", tier: "T2", dkps: 500 },
    ]
  },
  { nombre: "Wing Commander", tier: "T0", dkps: 50, sub: [] },
]

// Generador de historial para pruebas
const generateMockHistory = () => {
  const actividades = ["Operación", "Flota", "Entrenamiento", "Evento"];
  const especialidades = ["Pilot", "Soldier", "Capital Ship Pilot", "Wing Commander"];
  const data = [];
  const now = new Date();
  for (let i = 0; i < 50; i++) {
    const date = new Date();
    const daysOffset = i < 40 ? Math.floor(Math.random() * 14) : 30 + i;
    date.setDate(now.getDate() - daysOffset);
    data.push({
      fecha: date,
      id: Math.floor(Math.random() * 100) + 1,
      actividad: actividades[Math.floor(Math.random() * actividades.length)],
      especialidad: especialidades[Math.floor(Math.random() * especialidades.length)],
      dkps: Math.floor(Math.random() * 150) + 10,
    });
  }
  return data.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

const HISTORIAL_DATA = generateMockHistory();

export function ProfileViewer({ user }: { user: any }) {
  const [filtro, setFiltro] = useState("General");
  const [itemsAMostrar, setItemsAMostrar] = useState(12);
  const [expandedSpecialties, setExpandedSpecialties] = useState<string[]>([]);

  const toggleSpecialty = (name: string) => {
    setExpandedSpecialties(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const avatarUrl = user?.user_metadata?.avatar_url || "/placeholder.svg";
  const displayName = user?.user_metadata?.global_name || "Usuario";

  const historialFiltrado = useMemo(() => {
    return HISTORIAL_DATA.filter(item => filtro === "General" || item.actividad === filtro);
  }, [filtro]);

  const datosVisibles = historialFiltrado.slice(0, itemsAMostrar);

  const getMonthLabel = (date: Date) => {
    const now = new Date();
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      return "ESTE MES";
    }
    return date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 text-white">
      {/* IZQUIERDA */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <Image src={avatarUrl} alt={displayName} fill className="rounded-full border-2 border-primary object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tighter">{displayName}</h2>
            <p className="text-primary text-[10px] font-bold tracking-widest uppercase">Raider Elite</p>
          </div>
        </div>

        {/* DKPs por Actividad */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-white" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">DKPs por Actividad</span>
          </div>
          <div className="divide-y divide-zinc-900">
            {["Flotas", "Entrenamientos", "Operaciones", "Eventos", "Endgame"].map((label) => (
              <div key={label} className="flex justify-between items-center px-4 py-2.5 hover:bg-white/[0.02]">
                <span className="text-xs text-zinc-400">{label}</span>
                <span className="text-xs font-mono font-bold">450</span>
              </div>
            ))}
          </div>
        </div>

        {/* Especialidades */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-white" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">Especialidades</span>
          </div>
          <table className="w-full text-xs">
            <thead className="text-[8px] uppercase text-zinc-500 bg-zinc-900/20">
              <tr>
                <th className="text-left p-3">Especialidad</th>
                <th className="text-center p-3">Tier</th>
                <th className="text-right p-3">DKPs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {ESPECIALIDADES_DATA.map((esp) => {
                const isExpanded = expandedSpecialties.includes(esp.nombre);
                const hasSub = esp.sub.length > 0;
                return (
                  <React.Fragment key={esp.nombre}>
                    <tr 
                      className="group cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => hasSub && toggleSpecialty(esp.nombre)}
                    >
                      <td className="p-3 flex items-center gap-2">
                        <div className="bg-zinc-900 p-1 rounded-md border border-zinc-800">
                          {ICON_MAP[esp.nombre] || <Activity className="w-3 h-3 text-white" />}
                        </div>
                        <span className="font-bold text-zinc-200">{esp.nombre}</span>
                        {hasSub && (isExpanded ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <Plus className="w-3 h-3 text-primary" />)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getTierStyle(esp.tier)}`}>{esp.tier}</span>
                      </td>
                      <td className="p-3 text-right font-mono text-primary font-bold">{esp.dkps}</td>
                    </tr>
                    {isExpanded && esp.sub.map((sub) => (
                      <tr key={sub.nombre} className="bg-black/40 border-l-2 border-primary/30">
                        <td className="p-2 pl-10 flex items-center gap-2 text-zinc-400 text-[11px]">{sub.nombre}</td>
                        <td className="p-2 text-center">
                          <span className={`text-[8px] px-1 py-0.2 rounded border opacity-70 ${getTierStyle(sub.tier)}`}>{sub.tier}</span>
                        </td>
                        <td className="p-2 text-right font-mono text-zinc-400 text-[11px] pr-3">{sub.dkps}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DERECHA */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {["General", "Flota", "Operación", "Entrenamiento", "Evento"].map((cat) => (
            <button key={cat} onClick={() => { setFiltro(cat); setItemsAMostrar(12); }}
              className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest border transition-all ${
                filtro === cat ? "bg-primary border-primary text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"
              }`}>
              {cat === "General" ? "Actividad General" : cat + "s"}
            </button>
          ))}
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
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
              {datosVisibles.map((row, i) => {
                const currentMonth = getMonthLabel(row.fecha);
                const prevMonth = i > 0 ? getMonthLabel(datosVisibles[i-1].fecha) : null;
                const showHeader = currentMonth !== prevMonth;
                return (
                  <React.Fragment key={i}>
                    {showHeader && (
                      <tr className="bg-zinc-900/30">
                        <td colSpan={5} className="px-4 py-1.5 text-[10px] font-black text-primary tracking-[0.3em] border-b border-zinc-800">{currentMonth}</td>
                      </tr>
                    )}
                    <tr className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-4 py-2 text-zinc-500 font-mono text-[10px]">{row.fecha.toLocaleDateString('es-ES')}</td>
                      <td className="px-4 py-2 text-zinc-300 font-bold text-xs">#{row.id}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${ACTIVIDAD_STYLES[row.actividad]}`}>{row.actividad}</span>
                      </td>
                      <td className="px-4 py-2 text-zinc-400 text-xs flex items-center gap-2">
                        {ICON_MAP[row.especialidad] || <Activity className="w-3 h-3 text-white" />}
                        {row.especialidad}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-primary text-xs">+{row.dkps}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <div className="p-4 bg-zinc-900/30 flex justify-center items-center gap-4 border-t border-zinc-800">
            {historialFiltrado.length > itemsAMostrar && (
              <button onClick={() => setItemsAMostrar(p => p + 12)} className="px-6 py-2 bg-primary/5 border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-black transition-all">
                <Plus className="w-3 h-3 inline mr-2" /> Cargar más
              </button>
            )}
            {itemsAMostrar > 12 && (
              <button onClick={() => { setItemsAMostrar(12); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-6 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white">
                <ChevronUp className="w-3 h-3 inline mr-2" /> Colapsar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}