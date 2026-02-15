"use client"

import React, { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { 
  Rocket, Shield, Target, Award, Zap, Star, Plus, 
  ChevronUp, ChevronDown, Activity, Sword, Heart, UserPlus, Crosshair, Medal, X, ChevronRight,
  TrendingUp, Calendar, Box, StarOff
} from "lucide-react"
import { useDivision } from "@/context/DivisionContext"

// --- CONFIGURACIÓN DE COLORES POR CATEGORÍA ---
const COLORES_ACTIVIDAD: Record<string, string> = {
  "Operación": "bg-red-500/10 text-red-400 border-red-500/20",
  "Flota": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Entrenamiento": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Evento": "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const COLORES_APORTACIONES: Record<string, string> = {
  "Endgame": "bg-primary/10 text-primary border-primary/20",
  "Clean Air": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Contested Zone": "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const COLORES_INDUSTRIAL: Record<string, string> = {
  "Endgame": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Wikelo": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Bases": "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

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
    sub: [{ nombre: "Dogfighter", tier: "T3", dkps: 600 }, { nombre: "Flight Support", tier: "T2", dkps: 400 }]
  },
  { nombre: "Soldier", tier: "T2", dkps: 800, sub: [{ nombre: "Medic", tier: "T1", dkps: 300 }] },
];

const getTierStyle = (tier: string) => {
  switch(tier) {
    case "T3": return "bg-orange-500/20 text-orange-500 border-orange-500/50";
    case "T2": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    case "T1": return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    default: return "bg-zinc-800 text-zinc-400";
  }
}

const HISTORIAL_DATA = Array.from({ length: 50 }).map((_, i) => {
  const pools = [
    { cat: "ACTIVIDAD", types: ["Flota", "Operación", "Entrenamiento", "Evento"] },
    { cat: "APORTACIONES", types: ["Endgame", "Clean Air", "Contested Zone"] },
    { cat: "INDUSTRIAL", types: ["Endgame", "Wikelo", "Bases"] }
  ];
  const pool = pools[Math.floor(Math.random() * pools.length)];
  const date = new Date();
  date.setDate(date.getDate() - i);
  return {
    fecha: date,
    id: 1500 + i,
    seccion: pool.cat,
    actividad: pool.types[Math.floor(Math.random() * pool.types.length)],
    especialidad: "Pilot",
    dkps: Math.floor(Math.random() * 150) + 10,
  };
});

export function ProfileViewer({ user, isOwner = true }: { user: any, isOwner?: boolean }) {
  // Usamos el contexto solo para saber en qué modo visual estamos (Militar/Industrial)
  const { division } = useDivision();
  
  // ESTADO LOCAL PARA LA TABLA: Independiente del switch global
  const [seccionTabla, setSeccionTabla] = useState<"ACTIVIDAD" | "APORTACIONES" | "INDUSTRIAL">("ACTIVIDAD");
  const [filtro, setFiltro] = useState("General");
  
  const [itemsAMostrar, setItemsAMostrar] = useState(12);
  const [expandedSpecialties, setExpandedSpecialties] = useState<string[]>([]);
  const [tituloSeleccionado, setTituloSeleccionado] = useState(TITULOS_DISPONIBLES[0]);

  const toggleSpecialty = (name: string) => {
    setExpandedSpecialties(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const meta = user?.user_metadata;
  const avatarUrl = meta?.avatar_url || meta?.picture || "/placeholder.svg";
  const displayName = meta?.global_name || meta?.custom_claims?.global_name || meta?.display_name || "Usuario";

  const datosVisibles = useMemo(() => {
    return HISTORIAL_DATA.filter(item => {
      if (item.seccion !== seccionTabla) return false;
      if (filtro === "General") return true;
      return item.actividad === filtro;
    }).slice(0, itemsAMostrar);
  }, [seccionTabla, filtro, itemsAMostrar]);

  const getMonthLabel = (date: Date) => {
    return date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 text-white relative">
      
      {/* COLUMNA IZQUIERDA */}
      <div className="lg:col-span-4 space-y-6">
        {/* PERFIL */}
        <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <Image src={avatarUrl} alt={displayName} fill className="rounded-full border-2 border-primary object-cover shadow-lg shadow-primary/20" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter leading-none">{displayName}</h2>
              <p className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mt-2">Raider Elite</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border/50">
            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Título de Perfil</label>
            <select value={tituloSeleccionado} onChange={(e) => setTituloSeleccionado(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary transition-colors">
              {TITULOS_DISPONIBLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* TABLA DKPS RESUMEN */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl transition-all duration-500">
          <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-foreground" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">Resumen Actividad</span>
            </div>
          </div>
          <div className="divide-y divide-border/20">
            {RESUMEN_DKP.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 px-4 hover:bg-primary/5 transition-colors">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                <span className="font-mono font-bold text-xs text-foreground">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ESPECIALIDADES */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl transition-all duration-500">
          <div className="p-3 bg-muted/50 border-b border-border flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-foreground" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">Especialidades</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-border/20">
                {ESPECIALIDADES_DATA.map((esp) => {
                  const isExpanded = expandedSpecialties.includes(esp.nombre);
                  const hasSub = esp.sub.length > 0;
                  return (
                    <React.Fragment key={esp.nombre}>
                      <tr className="group cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => hasSub && toggleSpecialty(esp.nombre)}>
                        <td className="p-3 flex items-center gap-3 whitespace-nowrap text-foreground font-bold">
                          <div className="bg-background p-1.5 rounded-lg border border-border shrink-0">
                            {ICON_MAP[esp.nombre] || <Zap className="w-3.5 h-3.5" />}
                          </div>
                          {esp.nombre}
                          {hasSub && (isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <Plus className="w-3 h-3 text-primary" />)}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`text-[9px] px-2 py-0.5 rounded border font-black ${getTierStyle(esp.tier)}`}>{esp.tier}</span>
                        </td>
                        <td className="p-3 text-right font-mono text-primary font-bold">{esp.dkps}</td>
                      </tr>
                      {isExpanded && esp.sub.map((sub) => (
                        <tr key={sub.nombre} className="bg-background/40 border-l-2 border-primary/30">
                          <td className="p-2 pl-10 flex items-center gap-3 text-muted-foreground text-[11px] whitespace-nowrap">
                            <div className="bg-background p-1 rounded border border-border shrink-0">
                              {ICON_MAP[sub.nombre] || <Activity className="w-3 h-3" />}
                            </div>
                            {sub.nombre}
                          </td>
                          <td className="p-2 text-right">
                            <span className={`text-[8px] px-1.5 py-0.2 rounded border font-bold opacity-70 ${getTierStyle(sub.tier)}`}>{sub.tier}</span>
                          </td>
                          <td className="p-2 text-right font-mono text-muted-foreground text-[11px] pr-3 italic">{sub.dkps}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <div className="lg:col-span-8 space-y-6">
        {/* Chips Maestros: Solo cambian la tabla, NO la división global */}
        <div className="flex gap-3 border-b border-border pb-4 overflow-x-auto scrollbar-hide">
          {["ACTIVIDAD", "APORTACIONES", "INDUSTRIAL"].map((sec) => (
            <button 
              key={sec} 
              onClick={() => { 
                setSeccionTabla(sec as any); 
                setFiltro("General"); 
                setItemsAMostrar(12); 
              }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                seccionTabla === sec ? "bg-foreground text-background border-foreground shadow-lg shadow-white/10" : "bg-card/50 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Sub-filtros dinámicos */}
        <div className="flex flex-wrap gap-2">
          {seccionTabla === "ACTIVIDAD" && ["General", "Flota", "Operación", "Entrenamiento", "Evento"].map((cat) => (
            <button key={cat} onClick={() => setFiltro(cat)} className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${filtro === cat ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
              {cat === "General" ? "Actividad General" : cat + "s"}
            </button>
          ))}
          {seccionTabla === "APORTACIONES" && ["General", "Endgame", "Clean Air", "Contested Zone"].map((cat) => (
            <button key={cat} onClick={() => setFiltro(cat)} className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${filtro === cat ? "bg-amber-500 border-amber-500 text-black" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
              {cat === "General" ? "Aportaciones General" : cat}
            </button>
          ))}
          {seccionTabla === "INDUSTRIAL" && ["General", "Endgame", "Wikelo", "Bases"].map((cat) => (
            <button key={cat} onClick={() => setFiltro(cat)} className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${filtro === cat ? "bg-accent border-accent text-black shadow-[0_0_15px_rgba(53,182,236,0.3)]" : "bg-card border-border text-muted-foreground hover:text-accent"}`}>
              {cat === "General" ? "Industrial General" : cat}
            </button>
          ))}
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-2xl transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="text-[9px] uppercase text-muted-foreground bg-muted/50 font-bold italic">
                <tr>
                  <th className="px-4 py-3 border-b border-border">Fecha</th>
                  <th className="px-4 py-3 border-b border-border">ID</th>
                  <th className="px-4 py-3 border-b border-border">{seccionTabla === "ACTIVIDAD" ? "Actividad" : "Tarea"}</th>
                  <th className="px-4 py-3 border-b border-border text-right">DKPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-foreground">
                {datosVisibles.map((row, i) => {
                  const currentMonth = getMonthLabel(row.fecha);
                  const prevMonth = i > 0 ? getMonthLabel(datosVisibles[i-1].fecha) : null;
                  const showHeader = currentMonth !== prevMonth;
                  
                  let chipStyle = "bg-muted text-muted-foreground border-border";
                  if (seccionTabla === "ACTIVIDAD") chipStyle = COLORES_ACTIVIDAD[row.actividad] || chipStyle;
                  if (seccionTabla === "APORTACIONES") chipStyle = COLORES_APORTACIONES[row.actividad] || chipStyle;
                  if (seccionTabla === "INDUSTRIAL") chipStyle = COLORES_INDUSTRIAL[row.actividad] || chipStyle;

                  return (
                    <React.Fragment key={i}>
                      {showHeader && (
                        <tr className="bg-muted/30">
                          <td colSpan={4} className="px-4 py-2 text-[10px] font-black text-primary tracking-[0.4em] border-b border-border">{currentMonth}</td>
                        </tr>
                      )}
                      <tr className="hover:bg-primary/5 transition-colors group">
                        <td className="px-4 py-2 text-muted-foreground font-mono text-[10px]">{row.fecha.toLocaleDateString('es-ES')}</td>
                        <td className="px-4 py-2 text-foreground font-bold text-xs">#{row.id}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${chipStyle}`}>{row.actividad}</span>
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-primary text-xs">+{row.dkps}</td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-muted/30 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-border">
            {itemsAMostrar < HISTORIAL_DATA.filter(item => item.seccion === seccionTabla && (filtro === "General" || item.actividad === filtro)).length && (
              <button onClick={() => setItemsAMostrar(p => p + 12)} className="px-6 py-2 bg-primary/5 border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                <Plus className="w-3 h-3 inline mr-2" /> Cargar más
              </button>
            )}
            {itemsAMostrar > 12 && (
              <button onClick={() => setItemsAMostrar(12)} className="px-6 py-2 bg-muted/50 border border-border rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                <ChevronUp className="w-3 h-3 inline mr-2" /> Colapsar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}