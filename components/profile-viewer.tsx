"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { 
  Rocket, Shield, Target, Award, Zap, Star, Plus, 
  ChevronUp, ChevronDown, Activity, Sword, Heart, UserPlus, Crosshair, Medal, X, ChevronRight,
  TrendingUp, Calendar, Box, StarOff
} from "lucide-react"
import { useDivision } from "@/context/DivisionContext"

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
  const { division, setDivision } = useDivision();
  
  // Mapeamos el estado global a nuestra lógica local de secciones
  const seccionMaestra = (division.toUpperCase() as "ACTIVIDAD" | "APORTACIONES" | "INDUSTRIAL");

  const [filtro, setFiltro] = useState("General");
  const [itemsAMostrar, setItemsAMostrar] = useState(12);
  const [expandedSpecialties, setExpandedSpecialties] = useState<string[]>([]);
  const [tituloSeleccionado, setTituloSeleccionado] = useState(TITULOS_DISPONIBLES[0]);
  const [selectedMedal, setSelectedMedal] = useState<any | null>(null);

  const toggleSpecialty = (name: string) => {
    setExpandedSpecialties(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const meta = user?.user_metadata;
  const avatarUrl = meta?.avatar_url || meta?.picture || "/placeholder.svg";
  const displayName = meta?.global_name || meta?.custom_claims?.global_name || meta?.display_name || "Usuario";

  const datosVisibles = useMemo(() => {
    return HISTORIAL_DATA.filter(item => {
      if (item.seccion !== seccionMaestra) return false;
      if (filtro === "General") return true;
      return item.actividad === filtro;
    }).slice(0, itemsAMostrar);
  }, [seccionMaestra, filtro, itemsAMostrar]);

  const getMonthLabel = (date: Date) => {
    return date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 text-white relative">
      
      {/* MODAL DE MEDALLAS */}
      {selectedMedal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedMedal(null)}>
          <div className="relative max-w-lg w-full bg-card border border-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedMedal(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black rounded-full text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="relative aspect-square w-full">
              <Image src={selectedMedal.imageUrl} alt={selectedMedal.nombre} fill className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background p-8 text-center text-white">
                <h3 className="text-2xl font-black uppercase tracking-tighter">{selectedMedal.nombre}</h3>
                <p className="text-primary font-bold text-xs tracking-widest mt-1 uppercase font-mono">Otorgada el {selectedMedal.fecha}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLUMNA IZQUIERDA */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-6 bg-card/40 border border-border rounded-2xl space-y-4">
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
          <table className="w-full text-xs">
            <tbody className="divide-y divide-border/20">
              {ESPECIALIDADES_DATA.map((esp) => {
                const isExpanded = expandedSpecialties.includes(esp.nombre);
                const hasSub = esp.sub.length > 0;
                return (
                  <React.Fragment key={esp.nombre}>
                    <tr className="group cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => hasSub && toggleSpecialty(esp.nombre)}>
                      <td className="p-3 flex items-center gap-3 whitespace-nowrap">
                        <div className="bg-background p-1.5 rounded-lg border border-border">
                          {ICON_MAP[esp.nombre] || <Zap className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-bold text-foreground">{esp.nombre}</span>
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

      {/* COLUMNA DERECHA */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex gap-3 border-b border-border pb-4 overflow-x-auto scrollbar-hide">
          {["ACTIVIDAD", "APORTACIONES", "INDUSTRIAL"].map((sec) => (
            <button key={sec} onClick={() => { setDivision(sec.toLowerCase() as any); setFiltro("General"); setItemsAMostrar(12); }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                seccionMaestra === sec ? "bg-foreground text-background border-foreground shadow-lg shadow-white/10" : "bg-card/50 border-border text-muted-foreground hover:text-foreground"
              }`}>{sec}</button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {seccionMaestra === "ACTIVIDAD" && ["General", "Flota", "Operación", "Entrenamiento", "Evento"].map((cat) => (
            <button key={cat} onClick={() => setFiltro(cat)} className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${filtro === cat ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
              {cat === "General" ? "Actividad General" : cat + "s"}
            </button>
          ))}
          {seccionMaestra === "INDUSTRIAL" && ["General", "Endgame", "Wikelo", "Bases"].map((cat) => (
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
                  <th className="px-4 py-3 border-b border-border">{seccionMaestra === "ACTIVIDAD" ? "Actividad" : "Tarea"}</th>
                  <th className="px-4 py-3 border-b border-border text-right">DKPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-foreground">
                {datosVisibles.map((row, i) => {
                  const currentMonth = getMonthLabel(row.fecha);
                  const prevMonth = i > 0 ? getMonthLabel(datosVisibles[i-1].fecha) : null;
                  const showHeader = currentMonth !== prevMonth;
                  
                  let chipStyle = "bg-muted text-muted-foreground border-border";
                  if (seccionMaestra === "ACTIVIDAD") chipStyle = COLORES_ACTIVIDAD[row.actividad] || chipStyle;
                  if (seccionMaestra === "INDUSTRIAL") chipStyle = COLORES_INDUSTRIAL[row.actividad] || chipStyle;

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
            {itemsAMostrar < HISTORIAL_DATA.filter(item => item.seccion === seccionMaestra && (filtro === "General" || item.actividad === filtro)).length && (
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