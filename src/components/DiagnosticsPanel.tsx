/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Using the new JSX transform; explicit React import removed to avoid module resolution errors
import { ShieldCheck, ShieldAlert, TrendingUp, AlertTriangle, HelpCircle, Award, BarChart3, RotateCcw, Compass, BookOpen } from 'lucide-react';
import { UserSession, SpatialComprehensionReport } from '../types';

interface DiagnosticsPanelProps {
  session: UserSession;
  onResetProgress: () => void;
}

export default function DiagnosticsPanel({ session, onResetProgress }: DiagnosticsPanelProps) {
  const { diagnostics, progress, profileType, name, matricula } = session;

  // Let's compute a dynamic live report based on actual session stats to make it 100% real-time and robust
  const computeLiveReport = (): SpatialComprehensionReport => {
    let collisionsTotal = diagnostics.collisionsTotal;
    let jackknifesTotal = diagnostics.jackknifesTotal;
    let directionalErrors = diagnostics.directionalErrors;
    let reversesAttempted = diagnostics.reversesAttempted;
    let totalTimeSeconds = diagnostics.totalTimeSeconds;

    // Aggregate from finished challenges in session progress as well to keep in perfect sync
    progress.forEach(p => {
      collisionsTotal += p.collisions;
      jackknifesTotal += p.jackknifes;
    });

    // Score calculations
    // Base is 100
    let score = 100;
    score -= (collisionsTotal * 1.5);
    score -= (jackknifesTotal * 3.5);
    score -= (directionalErrors * 2.0);

    // Keep within bounds
    score = Math.max(10, Math.min(100, Math.round(score)));

    // Categorize
    let understandingStatus: SpatialComprehensionReport['understandingStatus'] = 'Excelente';
    let recommendation = '';

    if (score >= 85) {
      understandingStatus = 'Excelente';
      recommendation = profileType === 'P01' 
        ? '¡Excelente avance para un aspirante sin experiencia! Dominas la regla de oro del contravolante. Estás listo para desafíos difíciles o incorporarte a rutas controladas.'
        : 'Desempeño de nivel Maestro. Demuestras una comprensión espacial e intuitiva sobresaliente del remolque articulado. Apto para operaciones complejas de patio de muelle.';
    } else if (score >= 70) {
      understandingStatus = 'Aceptable';
      recommendation = profileType === 'P01'
        ? 'Buen progreso. Entiendes la lógica espacial inversa de la articulación, pero tiendes a sobrerreaccionar con el volante. Practica haciendo giros más pequeños.'
        : 'Aceptable. Mantienes el control en la mayoría de maniobras, aunque con algunos roces. Concéntrate en el "seguimiento" suave una vez acoplado.';
    } else if (score >= 50) {
      understandingStatus = 'Regular (Alerta)';
      recommendation = 'Alerta de comprensión. Se detectan movimientos de dirección que agravan el efecto tijera en lugar de corregirlo. Se recomienda utilizar el "Método de las 6 en punto" sosteniendo el volante por abajo para corregir la inversión espacial.';
    } else {
      understandingStatus = 'Sin Comprensión Spacial (Crítico)';
      recommendation = '¡NIVEL CRÍTICO REPETIDO! El operador muestra nula asimilación de la geometría articulada inversa. Tiende a girar el volante hacia el mismo lado que el desvío, provocando plegamientos (efecto tijera) inmediatos y colisiones recurrentes. Requiere suspender prácticas libres y realizar reforzamiento teórico intensivo presencial.';
    }

    return {
      matricula,
      profileType,
      collisionsTotal,
      jackknifesTotal,
      directionalErrors,
      reversesAttempted,
      totalTimeSeconds,
      score,
      understandingStatus,
      recommendation
    };
  };

  const liveDiagnostics = computeLiveReport();

  // Status visual themes
  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'Excelente':
        return { text: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', ring: 'border-emerald-500/30', label: 'Comprensión Excelente' };
      case 'Aceptable':
        return { text: 'text-blue-400 bg-blue-500/10 border-blue-500/25', ring: 'border-blue-500/30', label: 'Comprensión Operativa Aceptable' };
      case 'Regular (Alerta)':
        return { text: 'text-amber-400 bg-amber-500/10 border-amber-500/25', ring: 'border-amber-500/30', label: 'Alerta: Requiere Asistencia' };
      default:
        return { text: 'text-rose-400 bg-rose-500/10 border-rose-500/25', ring: 'border-rose-500/30', label: 'Sin Comprensión Espacial' };
    }
  };

  const theme = getStatusTheme(liveDiagnostics.understandingStatus);

  return (
    <div className="space-y-6">
      
      {/* Overview Diagnostics Dashboard */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Score Ring Display (5 Cols) */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-4 left-4 text-xs font-mono font-bold text-slate-500 uppercase">
            Índice de Destreza
          </div>

          {/* Radial score gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center mt-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                fill="none" 
                stroke={liveDiagnostics.score >= 80 ? '#10b981' : liveDiagnostics.score >= 60 ? '#f59e0b' : '#ef4444'} 
                strokeWidth="8" 
                strokeDasharray={`${liveDiagnostics.score * 2.63} 263`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white">{liveDiagnostics.score}%</span>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Aciertos</span>
            </div>
          </div>

          <div className={`mt-5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${theme.text} uppercase tracking-wider`}>
            {theme.label}
          </div>

          <p className="text-slate-400 text-xs mt-3 max-w-xs leading-normal">
            Calculado automáticamente analizando colisiones directas, tendencia al efecto tijera y desviaciones.
          </p>
        </div>

        {/* Detailed Metrics List (7 Cols) */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" /> Registro de Operaciones - {name}
            </h3>
            <span className="text-xs font-mono text-slate-400">Matrícula vinculada: {matricula}</span>
          </div>

          {/* Grid display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Colisiones</span>
              <span className="text-xl font-bold text-rose-400">{liveDiagnostics.collisionsTotal}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Tijeras (Lock)</span>
              <span className="text-xl font-bold text-amber-400">{liveDiagnostics.jackknifesTotal}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Desvíos Graves</span>
              <span className="text-xl font-bold text-indigo-400">{liveDiagnostics.directionalErrors}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Perfil UDAT</span>
              <span className="text-xs font-black text-sky-400 bg-sky-500/10 px-2 py-1 rounded inline-block mt-1">
                {profileType === 'P01' ? 'Sin Experiencia' : 'Con Experiencia'}
              </span>
            </div>

          </div>

          {/* Diagnostic interpretation box */}
          <div className={`p-4 rounded-xl border ${theme.text} text-xs leading-relaxed space-y-2`}>
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4" /> REPORTE DIAGNÓSTICO DE CONDUCTOR
            </div>
            <p className="text-slate-300 font-medium">
              {liveDiagnostics.recommendation}
            </p>
          </div>

        </div>

      </div>

      {/* Levels and Challenge progress ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block mb-4">
          Avance Detallado por Misiones de Patio
        </span>

        <div className="space-y-3">
          {[
            { id: 'straight', name: 'Muelle 1: Reversa en Línea Recta', diff: 'Fácil' },
            { id: 'offset', name: 'Muelle 2: Desvío en S (Offset)', diff: 'Medio' },
            { id: 'alley_dock', name: 'Muelle 3: Entrada a 90° (Alley Dock)', diff: 'Difícil' }
          ].map((level) => {
            const levelProg = progress.find(p => p.challengeId === level.id);
            const isCompleted = levelProg?.completed || false;
            
            return (
              <div 
                key={level.id} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-slate-950/40 border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{level.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      level.diff === 'Fácil' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : level.diff === 'Medio'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {level.diff}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {isCompleted 
                      ? 'Requisitos de estacionamiento y estabilidad cumplidos satisfactoriamente.' 
                      : 'Misión aún no completada o pendiente de evaluación.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <Award className="w-4 h-4" /> Aprobado
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-medium">
                      Pendiente
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            onClick={onResetProgress}
            className="flex items-center gap-1.5 px-4 py-2 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-800/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Borrar Progreso de la Sesión
          </button>
        </div>

      </div>

    </div>
  );
}
