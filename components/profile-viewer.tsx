"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import { 
  Rocket, Shield, Target, Award, Zap, Star, Plus, 
  ChevronUp, ChevronDown, Activity, Sword, Heart, UserPlus, Crosshair, Medal, X, ChevronRight,
  TrendingUp, Calendar, Box, StarOff
} from "lucide-react"

// --- TIPOS ---
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

interface Condecoracion {
  id: string;
  nombre: string;
  fecha: string;
  imageUrl: string;
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
  "Dogfighter": <Sword className="w-3.5 h-3.5 text-white" />,
  "Flight Support": <Activity className="w-3.5 h-3.5 text-white" />,
  "Multicrew Fighter": <UserPlus className="w-3.5 h-3.5 text-white" />,
  "Medic": <Heart className="w-3.5 h-3.5 text-white" />,
  "Infiltrator": <Crosshair className="w-3.5 h-3.5 text-white" />,
}

const TITULOS_DISPONIBLES = ["Ashborn", "Endgamer", "Outraider", "Mono"];

const CONDECORACIONES_MOCK: Condecoracion[] = [
  { id: "1", nombre: "Cruz de Valor", fecha: "2026-01-10", imageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=crop" },
  { id: "2", nombre: "As de Combate", fecha: "2025-12-15", imageUrl: "https://images.unsplash.com/photo-1589182397057-b82b76ff1bbd?q=80&w=500&auto=format&fit=crop" },
  { id: "3", nombre: "Servicio Distinguido", fecha: "2025-11-20", imageUrl: "https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?q=80&w=500&auto=format&fit=crop" },
];

const getTierStyle = (tier: string) => {
  switch(tier) {
    case "T3": return "bg-orange-500/20 text-orange-500 border-orange-500/50";
    case "T2": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    case "T1": return "bg-blue-500/20 text-blue-500 border-blue-500/50";
    case "T0": return "bg-zinc-700/50 text-zinc-400 border-zinc-600";
    default: return "bg-zinc-800 text-zinc-400";
  }
}

// --- DATOS MOCK ---
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
];

const RESUMEN_DKP = [
  { label: "Flotas", value: 1450, color: "text-white" },
  { label: "Entrenamientos", value: 890, color: "text-white" },
  { label: "Operaciones", value: 2100, color: "text-white" },
  { label: "Eventos", value: 650, color: "text-white" },
  { label: "Endgame", value: 4200, color: "text-text-white" },
];

const generateMockHistory = () => {
  const actividades = ["Operación", "Flota", "Entrenamiento", "Evento"];
  const especialidades = ["Pilot", "Soldier", "Capital Ship Pilot", "Wing Commander"];
  const data = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
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

export function ProfileViewer({ user, isOwner = true }: { user: any, isOwner?: boolean }) {
  const [filtro, setFiltro] = useState("General");
  const [itemsAMostrar, setItemsAMostrar] = useState(12);
  const [expandedSpecialties, setExpandedSpecialties] = useState<string[]>([]);
  const [tituloSeleccionado, setTituloSeleccionado] = useState(TITULOS_DISPONIBLES[0]);
  const [selectedMedal, setSelectedMedal] = useState<Condecoracion | null>(null);

  const toggleSpecialty = (name: string) => {
    setExpandedSpecialties(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const meta = user?.user_metadata;
  const avatarUrl = meta?.avatar_url || meta?.picture || "/placeholder.svg";
  const displayName = meta?.global_name || meta?.custom_claims?.global_name || meta?.display_name || "Usuario";

  const historialFiltrado = useMemo(() => {
    return HISTORIAL_DATA.filter(item => filtro === "General" || item.actividad === filtro);
  }, [filtro]);

  const datosVisibles = historialFiltrado.slice(0, itemsAMostrar);

  const getMonthLabel = (date: Date) => {
    const now = new Date();
    if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) return "ESTE MES";
    return date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 text-white relative">
      
      {/* MODAL DE CONDECORACIÓN */}
      {selectedMedal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedMedal(null)}>
          <div className="relative max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedMedal(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black rounded-full text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="relative aspect-square w-full">
              <Image src={selectedMedal.imageUrl} alt={selectedMedal.nombre} fill className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 p-8 text-center text-white">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{selectedMedal.nombre}</h3>
                <p className="text-primary font-bold text-xs md:text-sm tracking-widest mt-1 uppercase">Otorgada el {selectedMedal.fecha}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLUMNA IZQUIERDA */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Perfil & Título */}
        <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
              <Image src={avatarUrl} alt={displayName} fill className="rounded-full border-2 border-primary object-cover shadow-lg shadow-primary/20" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none truncate">{displayName}</h2>
              <p className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mt-2">Raider Elite</p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/50 text-white">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Título de Perfil</label>
            {isOwner ? (
              <select 
                value={tituloSeleccionado}
                onChange={(e) => setTituloSeleccionado(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-bold text-zinc-200 focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none shadow-inner"
              >
                {TITULOS_DISPONIBLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            ) : (
              <div className="px-3 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800 text-xs font-bold text-zinc-400">
                {tituloSeleccionado}
              </div>
            )}
          </div>
        </div>

        {/* TABLA DE DKPS (RESTAURADA CON CABECERA) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">Resumen Actividad</span>
            </div>
            {/* CABECERA DE LA COLUMNA DKPS */}
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pr-1">DKPS</span>
          </div>
          <div className="divide-y divide-zinc-900">
            {RESUMEN_DKP.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 px-4 hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{item.label}</span>
                {/* VALOR SOLO EN BLANCO */}
                <span className={`font-mono font-bold text-xs ${item.color}`}>{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Especialidades */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-white" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">Especialidades</span>
          </div>
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800">
            <table className="w-full text-xs min-width-[300px]">
              <tbody className="divide-y divide-zinc-900">
                {ESPECIALIDADES_DATA.map((esp) => {
                  const isExpanded = expandedSpecialties.includes(esp.nombre);
                  const hasSub = esp.sub.length > 0;
                  return (
                    <React.Fragment key={esp.nombre}>
                      <tr className="group cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => hasSub && toggleSpecialty(esp.nombre)}>
                        <td className="p-3 flex items-center gap-3 whitespace-nowrap">
                          <div className="bg-zinc-900 p-1.5 rounded-lg border border-zinc-800 shrink-0">{ICON_MAP[esp.nombre]}</div>
                          <span className="font-bold text-zinc-200">{esp.nombre}</span>
                          {hasSub && (isExpanded ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <Plus className="w-3 h-3 text-primary" />)}
                        </td>
                        <td className="p-3 text-right"><span className={`text-[9px] px-2 py-0.5 rounded border font-black ${getTierStyle(esp.tier)}`}>{esp.tier}</span></td>
                        <td className="p-3 text-right font-mono text-primary font-bold">{esp.dkps}</td>
                      </tr>
                      {isExpanded && esp.sub.map((sub) => (
                        <tr key={sub.nombre} className="bg-black/40 border-l-2 border-primary/30 group/sub">
                          <td className="p-2 pl-10 flex items-center gap-3 text-zinc-400 text-[11px] whitespace-nowrap">
                            <div className="bg-zinc-900/50 p-1 rounded border border-zinc-800 shrink-0">{ICON_MAP[sub.nombre]}</div>
                            {sub.nombre}
                          </td>
                          <td className="p-2 text-right"><span className={`text-[8px] px-1.5 py-0.2 rounded border font-bold opacity-70 ${getTierStyle(sub.tier)}`}>{sub.tier}</span></td>
                          <td className="p-2 text-right font-mono text-zinc-500 text-[11px] pr-3 italic">{sub.dkps}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Condecoraciones */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
            <Medal className="w-3.5 h-3.5 text-white" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">Condecoraciones</span>
          </div>
          <div className="divide-y divide-zinc-900">
            {CONDECORACIONES_MOCK.map((medal) => (
              <button key={medal.id} onClick={() => setSelectedMedal(medal)} className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-all group border-none text-left">
                <div className="min-w-0 pr-4">
                  <p className="text-xs font-bold text-zinc-200 uppercase group-hover:text-primary transition-colors tracking-tighter truncate">
                    {medal.nombre}
                  </p>
                  <p className="text-[10px] text-zinc-600 font-mono uppercase mt-0.5">
                    Otorgada: {medal.fecha}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline text-[8px] font-bold text-zinc-700 uppercase opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">Ver Medalla</span>
                  <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {["General", "Flota", "Operación", "Entrenamiento", "Evento"].map((cat) => (
            <button key={cat} onClick={() => { setFiltro(cat); setItemsAMostrar(12); }}
              className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
                filtro === cat ? "bg-primary border-primary text-black shadow-lg shadow-primary/20" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"
              }`}>
              {cat === "General" ? "Actividad General" : cat + "s"}
            </button>
          ))}
        </div>

        {/* Tabla Historial */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800">
            <table className="w-full text-left min-w-[600px]">
              <thead className="text-[9px] uppercase text-zinc-500 bg-zinc-900/50 font-bold italic">
                <tr>
                  <th className="px-4 py-3 border-b border-zinc-800">Fecha</th>
                  <th className="px-4 py-3 border-b border-zinc-800">ID</th>
                  <th className="px-4 py-3 border-b border-zinc-800">Actividad</th>
                  <th className="px-4 py-3 border-b border-zinc-800">Especialidad</th>
                  <th className="px-4 py-3 border-b border-zinc-800 text-right">DKPs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-white">
                {datosVisibles.map((row, i) => {
                  const currentMonth = getMonthLabel(row.fecha);
                  const prevMonth = i > 0 ? getMonthLabel(datosVisibles[i-1].fecha) : null;
                  const showHeader = currentMonth !== prevMonth;
                  return (
                    <React.Fragment key={i}>
                      {showHeader && (
                        <tr className="bg-zinc-900/30">
                          <td colSpan={5} className="px-4 py-2 text-[10px] font-black text-primary tracking-[0.4em] border-b border-zinc-800">{currentMonth}</td>
                        </tr>
                      )}
                      <tr className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-4 py-2 text-zinc-500 font-mono text-[10px] whitespace-nowrap">{row.fecha.toLocaleDateString('es-ES')}</td>
                        <td className="px-4 py-2 text-zinc-300 font-bold text-xs whitespace-nowrap">#{row.id}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${ACTIVIDAD_STYLES[row.actividad]}`}>{row.actividad}</span>
                        </td>
                        <td className="px-4 py-2 text-zinc-300 text-xs flex items-center gap-2 whitespace-nowrap">
                          <div className="opacity-50 group-hover:opacity-100 transition-opacity shrink-0">{ICON_MAP[row.especialidad] || <Activity className="w-3 h-3" />}</div>
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
          
          <div className="p-4 bg-zinc-900/30 flex justify-center items-center gap-4 border-t border-zinc-800">
            {historialFiltrado.length > itemsAMostrar && (
              <button onClick={() => setItemsAMostrar(p => p + 12)} className="px-6 py-2 bg-primary/5 border border-primary/20 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-black transition-all">
                <Plus className="w-3 h-3 inline mr-2" /> Cargar más
              </button>
            )}
            {itemsAMostrar > 12 && (
              <button onClick={() => { setItemsAMostrar(12); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-6 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-all">
                <ChevronUp className="w-3 h-3 inline mr-2" /> Colapsar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}