/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LogIn, Key, ShieldCheck, AlertCircle, Info, HelpCircle, Truck, Compass } from 'lucide-react';
import { UserSession, ProfileType } from '../types';

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [matricula, setMatricula] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [detectedProfile, setDetectedProfile] = useState<ProfileType | null>(null);

  // Auto-detect profile based on enrollment/registration format
  useEffect(() => {
    const normalized = matricula.trim().toUpperCase();
    if (normalized.endsWith('P01')) {
      setDetectedProfile('P01');
    } else if (normalized.endsWith('P02')) {
      setDetectedProfile('P02');
    } else {
      setDetectedProfile(null);
    }
  }, [matricula]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!matricula.trim()) {
      setError('Por favor ingresa tu matrícula.');
      return;
    }

    if (!name.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    const normalizedMatricula = matricula.trim().toUpperCase();
    
    // Check if ends with P01 or P02
    let profileType: ProfileType = 'P01';
    if (normalizedMatricula.endsWith('P02')) {
      profileType = 'P02';
    } else if (normalizedMatricula.endsWith('P01')) {
      profileType = 'P01';
    } else {
      setError('La matrícula debe terminar en "P01" (Sin experiencia) o "P02" (Con experiencia) para clasificar tu perfil de conductor.');
      return;
    }

    // Load existing session from localStorage if exists
    const storageKey = `trailer_lab_session_${normalizedMatricula}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const session = JSON.parse(savedData) as UserSession;
        // Keep updated name from input
        session.name = name.trim();
        localStorage.setItem(storageKey, JSON.stringify(session));
        onLogin(session);
        return;
      } catch (err) {
        console.error('Error parsing session', err);
      }
    }

    // Create fresh session
    const freshSession: UserSession = {
      matricula: normalizedMatricula,
      name: name.trim(),
      profileType,
      progress: [],
      customChallenges: [],
      diagnostics: {
        matricula: normalizedMatricula,
        profileType,
        collisionsTotal: 0,
        jackknifesTotal: 0,
        directionalErrors: 0,
        reversesAttempted: 0,
        totalTimeSeconds: 0,
        score: 100,
        understandingStatus: 'Excelente',
        recommendation: 'Inicia el simulador para evaluar tu comprensión espacial.'
      }
    };

    localStorage.setItem(storageKey, JSON.stringify(freshSession));
    onLogin(freshSession);
  };

  const handleQuickFill = (type: 'P01' | 'P02') => {
    if (type === 'P01') {
      setMatricula('UDAT G001 001 P01');
      setName('Conductor Aspirante (Novato)');
    } else {
      setMatricula('UDAT G001 001 P02');
      setName('Chofer Experimentado (Master)');
    }
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8 sm:p-10 space-y-6 relative z-10">
          
          {/* Header branding */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/15">
              <Truck className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase mt-4">
              Control de Accesos <span className="text-amber-500">UDAT</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Ingresa tu matrícula para iniciar el entrenamiento y registrar avances
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Matrícula Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Matrícula de Empleado/Aspirante
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej: UDAT G001 001 P01"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-sm text-slate-100 font-medium placeholder-slate-600 uppercase tracking-wide focus:outline-none transition-all"
                />
                <div className="absolute right-3.5 top-3 text-slate-600">
                  <Key className="w-4.5 h-4.5" />
                </div>
              </div>
            </div>

            {/* Profile Auto-detection visual feedback */}
            {detectedProfile && (
              <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                detectedProfile === 'P01'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              }`}>
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Perfil Detectado:</span>{' '}
                  {detectedProfile === 'P01' 
                    ? 'P01 - Persona Sin Experiencia (Prácticas asistidas)' 
                    : 'P02 - Persona Con Experiencia (Evaluación espacial avanzada)'
                  }
                </div>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Nombre Completo
              </label>
              <input
                type="text"
                placeholder="Ingresa tu nombre y apellido"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-sm text-slate-100 font-medium placeholder-slate-600 focus:outline-none transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4.5 h-4.5 stroke-[2.5]" />
              Iniciar Sesión de Entrenamiento
            </button>
          </form>

          {/* Quick-fill section (extremely useful for test evaluation / user onboarding) */}
          <div className="border-t border-slate-800/80 pt-5 space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block text-center">
              Plantillas de Prueba Rápidas
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickFill('P01')}
                className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 text-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <span className="text-blue-400 font-mono font-bold text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/10">P01</span>
                <span>Sin Experiencia</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleQuickFill('P02')}
                className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 text-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
              >
                <span className="text-emerald-400 font-mono font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">P02</span>
                <span>Con Experiencia</span>
              </button>
            </div>
          </div>

          {/* Educational format explanation */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50 flex gap-3 items-start text-[11px] text-slate-400 leading-normal">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300 mb-0.5">Estructura del Código UDAT:</p>
              <p>La matrícula codifica el grupo de entrenamiento y el perfil:</p>
              <p className="font-mono text-slate-500 mt-1">
                UDAT [Grupo] [Id] <span className="text-amber-500 font-bold">[P01/P02]</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
