"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { 
  Rocket, Shield, Target, Award, Zap, Star, Plus, 
  ChevronUp, ChevronDown, Activity, Sword, Heart, UserPlus, Crosshair, Medal, X, ChevronRight,
  TrendingUp, Calendar, Box, StarOff
} from "lucide-react"

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
  "Dogfighter": <Sword className="w-3.5 h-3.5 text-white" />,
  "Flight Support": <Activity className="w-3.5 h-3.5 text-white" />,
  "Multicrew Fighter": <UserPlus className="w-3.5 h-3.5 text-white" />,
  "Medic": <Heart className="w-3.5 h-3.5 text-white" />,
  "Infiltrator": <Crosshair className="w-3.5 h-3.5 text-white" />,
}

const TITULOS_DISPONIBLES = ["Ashborn", "Endgamer", "Outraider", "Mono"];

const CONDECORACIONES_MOCK = [
  { id: "1", nombre: "Cruz de Valor", fecha: "2026-01-10", imageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop" },
  { id: "2", nombre: "As de Combate", fecha: "2025-12-15", imageUrl: "https://images.unsplash.com/photo-1589182397057-b82b76ff1bbd?q=80&w=500&auto=format&fit=crop" },
];

const RESUMEN_DKP = [
  { label: "Flotas", value: 1450, color: "text-white" },
  { label: "Entrenamientos", value: 890, color: "text-white" },
  { label: "Operaciones", value: 2100, color: "text-white" },
  { label: "Eventos", value: 650, color: "text-white" },
  { label: "Endgame", value: 4200, color: "text-white" },
];

const ESPECIALIDADES_DATA = [
  { 
    nombre: "Pilot", tier: "T3", dkps: 1200,
    sub: [{ nombre: "Dogfighter", tier: "T3", dkps: 600 }]
  },
  { nombre: "Soldier", tier: "T2", dkps: 800, sub: [] },
];

const HISTORIAL_MOCK = () => {
  const acts = ["Flota", "Operación", "Endgame", "Clean Air", "Wikelo", "Bases"];
  return Array.from({ length: 30 }).map((_, i) => ({
    fecha: new Date(Date.now() - i * 86400000),
    id: 1000 + i,
    actividad: acts[Math.floor(Math.random() * acts.length)],
    especialidad: "Pilot",
    dkps: Math.floor(Math.random() * 100) + 10,
  }));
};

const getTierStyle = (tier: string) => {
  switch(tier) {
    case "T3": return "bg-orange-500/20 text-orange-500 border-orange-500/50";
    case "T2": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    case "T1": return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    default: return "bg-zinc-800 text-zinc-400";
  }
}

export function ProfileViewer({ user, isOwner = true }: { user: any, isOwner?: boolean }) {
  const [seccionMaestra, setSeccionMaestra] = useState<"ACTIVIDAD" | "APORTACIONES" | "INDUSTRIAL">("ACTIVIDAD");
  const [filtro, setFiltro] = useState("General");
  const [itemsAMostrar, setItemsAMostrar] = useState(12);
  const [expandedSpecialties, setExpandedSpecialties] = useState<string[]>([]);
  const [tituloSeleccionado, setTituloSeleccionado] = useState(TITULOS_DISPONIBLES[0]);
  const [selectedMedal, setSelectedMedal] = useState<any | null>(null);

  const meta = user?.user_metadata;
  const avatarUrl = meta?.avatar_url || meta?.picture || "/placeholder.svg";
  const displayName = meta?.global_name || meta?.custom_claims?.global_name || meta?.display_name || "Usuario";

  const datosVisibles = useMemo(() => {
    const raw = HISTORIAL_MOCK();
    return raw.filter(item => {
      if (filtro === "General") return true;
      return item.actividad === filtro;
    }).slice(0, itemsAMostrar);
  }, [filtro, itemsAMostrar, seccionMaestra]);

  const getMonthLabel = (date: Date) => {
    return date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 text-white relative">
      
      {/* COLUMNA IZQUIERDA */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-4">
            <Image src={avatarUrl} alt={displayName} width={64} height={64} className="rounded-full border-2 border-primary shadow-lg shadow-primary/20" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter leading-none">{displayName}</h2>
              <p className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mt-2">Raider Elite</p>
            </div>
          </div>
          <div className="pt-4 border-t border-zinc-800/50">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Título de Perfil</label>
            <select 
              value={tituloSeleccionado}
              onChange={(e) => setTituloSeleccionado(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-bold"
            >
              {TITULOS_DISPONIBLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* TABLA DE DKPS */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">Resumen Actividad</span>
            </div>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pr-1">DKPS</span>
          </div>
          <div className="divide-y divide-zinc-900">
            {RESUMEN_DKP.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 px-4 hover:bg-white/[0.02]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{item.label}</span>
                <span className={`font-mono font-bold text-xs ${item.color}`}>{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ESPECIALIDADES */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-white" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">Especialidades</span>
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-zinc-900">
              {ESPECIALIDADES_DATA.map((esp) => (
                <tr key={esp.nombre}>
                  <td className="p-3 font-bold text-zinc-200">{esp.nombre}</td>
                  <td className="p-3 text-right"><span className={`text-[9px] px-2 py-0.5 rounded border font-black ${getTierStyle(esp.tier)}`}>{esp.tier}</span></td>
                  <td className="p-3 text-right font-mono text-primary font-bold">{esp.dkps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COLUMNA DERECHA (SISTEMA DE CHIPS Y TABLA DINÁMICA) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* NIVEL 1: CHIPS MAESTROS */}
        <div className="flex gap-3 border-b border-zinc-800 pb-4 overflow-x-auto">
          {["ACTIVIDAD", "APORTACIONES", "INDUSTRIAL"].map((sec) => (
            <button
              key={sec}
              onClick={() => {
                setSeccionMaestra(sec as any);
                setFiltro("General");
                setItemsAMostrar(12);
              }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all whitespace-nowrap ${
                seccionMaestra === sec 
                  ? "bg-white text-black border-white shadow-lg shadow-white/10" 
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* NIVEL 2: SUB-FILTROS DINÁMICOS */}
        <div className="flex flex-wrap gap-2">
          {seccionMaestra === "ACTIVIDAD" && ["General", "Flota", "Operación", "Entrenamiento", "Evento"].map((cat) => (
            <button key={cat} onClick={() => setFiltro(cat)}
              className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
                filtro === cat ? "bg-primary border-primary text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"
              }`}>
              {cat === "General" ? "Actividad General" : cat + "s"}
            </button>
          ))}

          {seccionMaestra === "APORTACIONES" && ["General", "Endgame", "Clean Air", "Contested Zone"].map((cat) => (
            <button key={cat} onClick={() => setFiltro(cat)}
              className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
                filtro === cat ? "bg-amber-500 border-amber-500 text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-amber-400"
              }`}>
              {cat === "General" ? "Aportaciones General" : cat}
            </button>
          ))}

          {seccionMaestra === "INDUSTRIAL" && ["General", "Endgame", "Wikelo", "Bases"].map((cat) => (
            <button key={cat} onClick={() => setFiltro(cat)}
              className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${
                filtro === cat ? "bg-cyan-500 border-cyan-500 text-black" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-cyan-400"
              }`}>
              {cat === "General" ? "Industrial General" : cat}
            </button>
          ))}
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="text-[9px] uppercase text-zinc-500 bg-zinc-900/50 font-bold italic">
                <tr>
                  <th className="px-4 py-3 border-b border-zinc-800">Fecha</th>
                  <th className="px-4 py-3 border-b border-zinc-800">ID</th>
                  <th className="px-4 py-3 border-b border-zinc-800">
                    {seccionMaestra === "ACTIVIDAD" ? "Actividad" : seccionMaestra === "APORTACIONES" ? "Aportación" : "Tarea"}
                  </th>
                  <th className="px-4 py-3 border-b border-zinc-800">Especialidad</th>
                  <th className="px-4 py-3 border-b border-zinc-800 text-right">DKPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-white">
                {datosVisibles.map((row, i) => {
                  const currentMonth = getMonthLabel(row.fecha);
                  const prevMonth = i > 0 ? getMonthLabel(datosVisibles[i-1].fecha) : null;
                  const showHeader = currentMonth !== prevMonth;
                  
                  // Color dinámico según sección
                  const chipBaseStyle = seccionMaestra === "ACTIVIDAD" ? (ACTIVIDAD_STYLES[row.actividad] || "bg-zinc-800 text-zinc-400 border-zinc-700")
                                      : seccionMaestra === "APORTACIONES" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

                  return (
                    <React.Fragment key={i}>
                      {showHeader && (
                        <tr className="bg-zinc-900/30">
                          <td colSpan={5} className="px-4 py-2 text-[10px] font-black text-primary tracking-[0.4em] border-b border-zinc-800">{currentMonth}</td>
                        </tr>
                      )}
                      <tr className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-4 py-2 text-zinc-500 font-mono text-[10px]">{row.fecha.toLocaleDateString('es-ES')}</td>
                        <td className="px-4 py-2 text-zinc-300 font-bold text-xs">#{row.id}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${chipBaseStyle}`}>
                            {row.actividad}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-zinc-300 text-xs flex items-center gap-2">
                          {ICON_MAP[row.especialidad] || <Activity className="w-3 h-3" />}
                          {row.especialidad}
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-primary text-xs">+{row.dkps}</td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-zinc-900/30 flex justify-center border-t border-zinc-800">
            <button onClick={() => setItemsAMostrar(p => p + 12)} className="px-6 py-2 bg-primary/5 border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-black transition-all">
              <Plus className="w-3 h-3 inline mr-2" /> Cargar más
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}