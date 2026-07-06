/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Compass, AlertTriangle, HelpCircle, ArrowRightLeft, Info, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function TheorySection() {
  const [activeTab, setActiveTab] = useState<'giro' | 'tijera' | 'longitud' | 'trucos'>('giro');
  const [jackknifeAngle, setJackknifeAngle] = useState<number>(25); // in degrees

  // Helper to determine the safety state of the jackknife angle
  const getJackknifeStatus = (angle: number) => {
    const absAngle = Math.abs(angle);
    if (absAngle < 30) {
      return { label: 'Zona Segura', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', desc: 'El remolque responde de forma controlada. Es fácil enderezar con giros suaves.' };
    } else if (absAngle < 60) {
      return { label: 'Zona de Alerta (Peligro)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', desc: 'El ángulo es pronunciado. Debes empezar a girar el volante en la dirección opuesta inmediatamente para "seguir" el remolque, o de lo contrario se doblará por completo.' };
    } else {
      return { label: '¡Efecto Tijera! (Bloqueo)', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', desc: 'Ángulo irrecuperable en reversa. Si continúas dando marcha atrás, golpearás el remolque con la cabina. Solución: Debes avanzar hacia adelante para volver a enderezar la unidad.' };
    }
  };

  const status = getJackknifeStatus(jackknifeAngle);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight">Manual Teórico de Reversa</h2>
          <p className="text-slate-400 text-sm">Comprende la física y geometría detrás de las unidades articuladas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-4">
        {[
          { id: 'giro', label: 'El Giro Inverso', icon: ArrowRightLeft },
          { id: 'tijera', label: 'Efecto Tijera', icon: AlertTriangle },
          { id: 'longitud', label: 'Largo del Remolque', icon: Compass },
          { id: 'trucos', label: 'Tips de Choferes', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/15'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="min-h-[350px]">
        {activeTab === 'giro' && (
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-amber-400">La Regla de Oro: El Contravolante</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                A diferencia de un automóvil común, cuando das marcha atrás en un tráiler,{' '}
                <strong className="text-white">el remolque gira en la dirección OPUESTA a la que giras el volante.</strong>
              </p>
              
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs mt-0.5 shrink-0">1</div>
                  <p className="text-xs text-slate-300">
                    <strong className="text-blue-400">Girar Volante a la Derecha ➡️</strong> hace que la parte trasera del tractor empuje el enganche hacia la derecha, provocando que la parte trasera del remolque vaya hacia la <strong className="text-blue-300">IZQUIERDA ⬅️</strong>.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs mt-0.5 shrink-0">2</div>
                  <p className="text-xs text-slate-300">
                    <strong className="text-amber-400">Girar Volante a la Izquierda ⬅️</strong> empuja el enganche a la izquierda, lo que hace que la parte trasera del remolque vaya hacia la <strong className="text-amber-300">DERECHA ➡️</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 flex gap-2.5 items-start">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  <span className="text-slate-300 font-semibold">El truco del "Seguimiento":</span> Una vez que el remolque ha tomado el ángulo que deseas, debes girar el volante hacia el mismo lado que va el remolque para "seguirlo" y mantener la curva de manera controlada.
                </p>
              </div>
            </div>

            {/* Interactive SVG diagram for Steering */}
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[280px]">
              <span className="text-xs text-slate-500 mb-4 font-mono">DIAGRAMA DEL PUNTO DE GIRO (REVERSA)</span>
              
              <svg className="w-full max-w-[240px] h-[200px]" viewBox="0 0 120 100">
                {/* Visual force arrows */}
                {/* Steering wheel vector */}
                <path d="M 20 20 Q 35 10 50 20" fill="none" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" strokeDasharray="3 2" />
                <text x="35" y="35" fill="#f59e0b" fontSize="7" textAnchor="middle" className="font-semibold">Volante Izquierda</text>

                {/* Tractor body (with angle) */}
                <g transform="translate(60, 45) rotate(-15)">
                  {/* Tractor box */}
                  <rect x="-10" y="-18" width="20" height="30" rx="3" fill="#3b82f6" fillOpacity="0.8" stroke="#60a5fa" strokeWidth="1" />
                  {/* Cabin windshield */}
                  <rect x="-8" y="-14" width="16" height="5" fill="#1e293b" />
                  {/* Steered Front wheels (turned left) */}
                  <rect x="-11" y="-14" width="3" height="7" rx="1" fill="#f59e0b" transform="rotate(-20, -9.5, -10.5)" />
                  <rect x="8" y="-14" width="3" height="7" rx="1" fill="#f59e0b" transform="rotate(-20, 9.5, -10.5)" />
                  {/* Rear wheels */}
                  <rect x="-11" y="4" width="3" height="8" rx="1" fill="#020617" />
                  <rect x="8" y="4" width="3" height="8" rx="1" fill="#020617" />
                  {/* Fifth wheel hitch */}
                  <circle cx="0" cy="10" r="3" fill="#94a3b8" />
                  
                  {/* Connector line to trailer */}
                  <line x1="0" y1="10" x2="0" y2="15" stroke="#f1f5f9" strokeWidth="2" />
                </g>

                {/* Hitch Pivot */}
                {/* Trailer body (pivoted in opposite angle) */}
                <g transform="translate(60, 55) rotate(15)">
                  {/* Trailer box */}
                  <rect x="-11" y="2" width="22" height="38" rx="2" fill="#e2e8f0" fillOpacity="0.9" stroke="#94a3b8" strokeWidth="1" />
                  {/* Trailer wheels */}
                  <rect x="-13" y="28" width="3" height="10" rx="1" fill="#020617" />
                  <rect x="10" y="28" width="3" height="10" rx="1" fill="#020617" />
                  
                  {/* Rear direction indicator arrow */}
                  <path d="M 0 38 L 0 52" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
                  <polygon points="0,54 -3,49 3,49" fill="#ef4444" />
                </g>

                {/* SVG Arrow Marker definition */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                  </marker>
                </defs>
              </svg>

              <div className="mt-2 text-center text-[11px] text-slate-400">
                El tractor gira a la izquierda. El remolque pivota y se desvía a la <strong className="text-rose-400">derecha</strong>.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tijera' && (
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-amber-400">¿Qué es el "Efecto Tijera" (Jackknife)?</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Ocurre cuando el ángulo entre la cabina y el remolque se vuelve demasiado agudo. Llegado a cierto punto crítico,{' '}
                <strong className="text-white">la fuerza de la reversa ya no hace girar al remolque, sino que lo empuja lateralmente</strong>, doblando la unidad sobre sí misma de forma destructiva.
              </p>

              {/* Dynamic Status box */}
              <div className={`p-4 rounded-xl border transition-all ${status.color}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">{status.label}</span>
                  <span className="text-xs font-mono font-semibold">Ángulo: {jackknifeAngle}°</span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">{status.desc}</p>
              </div>

              {/* Control Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>Izquierda Max (-80°)</span>
                  <span>Centrado (0°)</span>
                  <span>Derecha Max (80°)</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  value={jackknifeAngle}
                  onChange={(e) => setJackknifeAngle(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer border border-slate-800"
                />
                <div className="flex justify-center">
                  <button
                    onClick={() => setJackknifeAngle(0)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resetear a 0°
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive SVG rendering based on slider */}
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[280px]">
              <span className="text-xs text-slate-500 mb-4 font-mono">VISUALIZADOR ANGULAR EN REVERSA</span>
              
              <svg className="w-full max-w-[200px] h-[180px]" viewBox="0 0 100 100">
                {/* Compass Circle background */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 4" />
                
                {/* Stationary trailer (as reference, or we pivot both around hitch. Let's make trailer stationary pointing up, and pivot tractor. This makes the angle extremely clear!) */}
                {/* Trailer */}
                <g transform="translate(50, 50)">
                  {/* Trailer Chassis pointing down */}
                  <rect x="-10" y="0" width="20" height="35" rx="1.5" fill="#e2e8f0" fillOpacity="0.4" stroke="#94a3b8" strokeWidth="1" />
                  <rect x="-11" y="24" width="2" height="8" rx="0.5" fill="#000" />
                  <rect x="9" y="24" width="2" height="8" rx="0.5" fill="#000" />
                  <line x1="0" y1="0" x2="0" y2="40" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                  
                  {/* Hitch point center */}
                  <circle cx="0" cy="0" r="3.5" fill="#f59e0b" />
                  
                  {/* Tractor (pivoting relative to trailer) */}
                  <g transform={`rotate(${-jackknifeAngle})`}>
                    {/* Visual warning arc */}
                    <path 
                      d={`M 0 -12 A 12 12 0 0 ${jackknifeAngle >= 0 ? 1 : 0} ${12 * Math.sin(jackknifeAngle * Math.PI / 180)} ${-12 * Math.cos(jackknifeAngle * Math.PI / 180)}`} 
                      fill="none" 
                      stroke={Math.abs(jackknifeAngle) < 30 ? "#10b981" : Math.abs(jackknifeAngle) < 60 ? "#f59e0b" : "#ef4444"} 
                      strokeWidth="2" 
                    />
                    
                    {/* Tractor Chassis (pointing up from hitch) */}
                    <rect x="-8" y="-24" width="16" height="24" rx="2.5" fill="#3b82f6" fillOpacity="0.8" stroke="#60a5fa" strokeWidth="1" />
                    {/* Windshield */}
                    <rect x="-6.5" y="-21" width="13" height="4" fill="#0f172a" />
                    {/* Wheels */}
                    <rect x="-9.5" y="-20" width="2" height="6" rx="0.5" fill="#000" />
                    <rect x="7.5" y="-20" width="2" height="6" rx="0.5" fill="#000" />
                    <rect x="-9.5" y="-8" width="2" height="6" rx="0.5" fill="#000" />
                    <rect x="7.5" y="-8" width="2" height="6" rx="0.5" fill="#000" />
                  </g>
                </g>

                {/* Labels */}
                <text x="50" y="93" fill="#94a3b8" fontSize="6.5" textAnchor="middle" className="font-mono">Remolque (Fijo)</text>
                <text x="50" y="10" fill="#3b82f6" fontSize="6.5" textAnchor="middle" className="font-mono">Cabina (Móvil)</text>
              </svg>
              
              <div className="mt-2 text-center">
                {Math.abs(jackknifeAngle) >= 60 ? (
                  <span className="text-[11px] font-bold text-rose-400 uppercase flex items-center justify-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> ¡Plegamiento de Unidad!
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Ángulo de articulación seguro.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'longitud' && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-amber-400">La Paradoja del Largo del Remolque</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Un error muy común de los principiantes es pensar que los remolques pequeños son más fáciles de echar en reversa. <strong className="text-white">La realidad física es exactamente lo contrario:</strong>
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Short Trailer */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-rose-400">Remolques Cortos (Pestañas, Lanchas)</h4>
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono font-bold">ALTA DIFICULTAD</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Debido a la poca distancia entre el pivote y su eje trasero, reaccionan de manera extremadamente veloz. Un pequeño giro en el volante produce un ángulo enorme al instante. Requieren movimientos milimétricos del volante y un tiempo de reacción extremadamente rápido.
                </p>
                <div className="h-2 w-1/3 bg-rose-500 rounded-full" />
                <span className="text-[11px] text-slate-500 block font-mono">Tiempo de reacción: ~0.5 segundos</span>
              </div>

              {/* Long Trailer */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-emerald-400">Remolques Largos (Semi-remolques de 53 pies)</h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">BAJA DIFICULTAD</span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Su enorme longitud hace que se muevan lentamente en respuesta a los giros del camión. Tienes mucho tiempo para notar que se está desviando y corregir con calma. Aunque requieren mayor espacio para maniobrar, mantener la trayectoria recta es infinitamente más fácil.
                </p>
                <div className="h-2 w-full bg-emerald-500 rounded-full" />
                <span className="text-[11px] text-slate-500 block font-mono">Tiempo de reacción: ~3-5 segundos</span>
              </div>
            </div>

            <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 text-xs text-slate-300 flex gap-3 items-start">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-400">¡Pruébalo tú mismo!</p>
                <p className="text-slate-400 mt-0.5">
                  En nuestro simulador de arriba, puedes cambiar el largo del remolque en el Modo Libre. Configura el largo en "Corto" y verás lo rápido que hace el efecto tijera, luego cámbialo a "Largo" para experimentar la estabilidad de un tráiler real.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trucos' && (
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-amber-400">Truco Infalible: La Posición de las 6</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-sans">
                ¿Te confunde girar al revés? Los camioneros experimentados utilizan un método psicológico muy sencillo:
              </p>

              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-amber-400 uppercase">¿CÓMO FUNCIONA?</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sujeta el volante con una sola mano por la <strong className="text-white">PARTE INFERIOR (las 6 en punto)</strong>.
                  </p>
                  <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                    <li>Mueve la mano hacia la <strong className="text-blue-400">Izquierda ⬅️</strong> y la parte trasera del remolque irá hacia la <strong className="text-blue-300">Izquierda ⬅️</strong>.</li>
                    <li>Mueve la mano hacia la <strong className="text-amber-400">Derecha ➡️</strong> y la parte trasera del remolque irá hacia la <strong className="text-amber-300">Derecha ➡️</strong>.</li>
                  </ul>
                </div>

                <p className="text-xs text-slate-400">
                  Esto anula mentalmente la contradicción espacial. Al tomar el volante por abajo, la dirección de tu mano se alinea de forma intuitiva con el movimiento del tráiler.
                </p>
              </div>
            </div>

            {/* Visual display for the Steering Trick */}
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[280px]">
              <span className="text-xs text-slate-500 mb-4 font-mono">TÉCNICA DE LAS 6 EN PUNTO</span>
              
              <svg className="w-[180px] h-[180px]" viewBox="0 0 100 100">
                {/* Steering wheel */}
                <circle cx="50" cy="50" r="35" fill="none" stroke="#64748b" strokeWidth="4" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="#475569" strokeWidth="1.5" />
                
                {/* Inner spokes */}
                <line x1="18" y1="50" x2="82" y2="50" stroke="#475569" strokeWidth="3" />
                <line x1="50" y1="50" x2="50" y2="82" stroke="#475569" strokeWidth="3.5" />
                <circle cx="50" cy="50" r="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                
                {/* Left hand movement indicators */}
                <path d="M 35 92 Q 22 88 15 75" fill="none" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#blue-arrow)" strokeDasharray="3 2" />
                <text x="12" y="94" fill="#3b82f6" fontSize="6.5" className="font-mono font-bold">Mano a la izq. = Remolque a la izq.</text>

                {/* Right hand movement indicators */}
                <path d="M 65 92 Q 78 88 85 75" fill="none" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#amber-arrow)" strokeDasharray="3 2" />
                <text x="88" y="94" fill="#f59e0b" fontSize="6.5" textAnchor="end" className="font-mono font-bold">Mano a la der. = Remolque a la der.</text>

                {/* The Hand icon at the bottom (6 o'clock) */}
                <g transform="translate(50, 85)">
                  <circle cx="0" cy="0" r="6" fill="#ef4444" className="animate-ping opacity-25" />
                  <circle cx="0" cy="0" r="5" fill="#f59e0b" stroke="#fff" strokeWidth="1" />
                  <text x="0" y="2.5" fill="#1e293b" fontSize="7" textAnchor="middle" className="font-bold font-sans">6h</text>
                </g>

                <defs>
                  <marker id="blue-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                  <marker id="amber-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                  </marker>
                </defs>
              </svg>

              <div className="mt-3 text-center text-[11px] text-slate-400">
                Sostén el volante justo en el punto <strong className="text-red-400">"6h"</strong> para resolver la contradicción espacial.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
