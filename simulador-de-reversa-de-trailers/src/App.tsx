/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Truck, BookOpen, Gamepad2, Info, GraduationCap, Compass, ExternalLink, LogOut, LayoutGrid, BarChart3, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TrailerSimulator from './components/TrailerSimulator';
import TheorySection from './components/TheorySection';
import LoginScreen from './components/LoginScreen';
import ManiobraEditor from './components/ManiobraEditor';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import { UserSession, Challenge } from './types';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<'simulador' | 'disenador' | 'diagnostico' | 'teoria'>('simulador');
  const [activeOverrideChallenge, setActiveOverrideChallenge] = useState<Challenge | null>(null);

  // Load session from localStorage on initial boot if available
  useEffect(() => {
    const keys = Object.keys(localStorage);
    const sessionKey = keys.find(k => k.startsWith('trailer_lab_session_'));
    if (sessionKey) {
      try {
        const saved = localStorage.getItem(sessionKey);
        if (saved) {
          setSession(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Error loading session', e);
      }
    }
  }, []);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    setActiveTab('simulador');
  };

  const handleUpdateSession = (updatedSession: UserSession) => {
    setSession(updatedSession);
    const storageKey = `trailer_lab_session_${updatedSession.matricula}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedSession));
  };

  const handleLogout = () => {
    if (session) {
      const storageKey = `trailer_lab_session_${session.matricula}`;
      localStorage.removeItem(storageKey);
    }
    setSession(null);
    setActiveOverrideChallenge(null);
    setActiveTab('simulador');
  };

  // Add custom challenge created in Editor to user session and play immediately
  const handleSaveChallenge = (challenge: Challenge) => {
    if (!session) return;
    
    const updatedCustoms = [...(session.customChallenges || [])];
    const existingIdx = updatedCustoms.findIndex(c => c.id === challenge.id);
    if (existingIdx !== -1) {
      updatedCustoms[existingIdx] = challenge;
    } else {
      updatedCustoms.push(challenge);
    }

    const updatedSession: UserSession = {
      ...session,
      customChallenges: updatedCustoms
    };

    handleUpdateSession(updatedSession);
  };

  const handleSelectAndPlayChallenge = (challenge: Challenge) => {
    handleSaveChallenge(challenge);
    setActiveOverrideChallenge(challenge);
    setActiveTab('simulador');
  };

  const handleResetProgress = () => {
    if (!session) return;
    const freshDiagnostics = {
      matricula: session.matricula,
      profileType: session.profileType,
      collisionsTotal: 0,
      jackknifesTotal: 0,
      directionalErrors: 0,
      reversesAttempted: 0,
      totalTimeSeconds: 0,
      score: 100,
      understandingStatus: 'Excelente' as const,
      recommendation: 'Inicia el simulador para evaluar tu comprensión espacial.'
    };

    const updatedSession: UserSession = {
      ...session,
      progress: [],
      diagnostics: freshDiagnostics
    };

    handleUpdateSession(updatedSession);
  };

  // Render Login state first
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between">
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md py-6">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-xl">
                <Truck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h1 className="text-base font-black tracking-wider uppercase text-white">
                Tráiler Reversa <span className="text-amber-500">Lab</span>
              </h1>
            </div>
            <span className="text-[10px] bg-slate-900 text-slate-500 font-mono px-2 py-1 rounded border border-slate-800">
              SISTEMA EVALUADOR v2.1
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-10">
          <LoginScreen onLogin={handleLogin} />
        </main>

        <footer className="border-t border-slate-900/80 py-6 text-center text-[11px] text-slate-600 font-mono">
          Consorcio de Transporte UDAT - Todos los derechos reservados © 2026
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Cockpit Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 sm:py-0">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/10">
              <Truck className="w-5 h-5 stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-wider uppercase text-white">
                  Tráiler Reversa <span className="text-amber-500">Lab</span>
                </h1>
                <span className="text-[9px] bg-slate-900 text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-800">
                  {session.matricula}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Conductor: <strong className="text-slate-300">{session.name}</strong> ({session.profileType === 'P01' ? 'Sin Experiencia' : 'Con Experiencia'})
              </p>
            </div>
          </div>

          {/* Immersive Tabs Navigation Panel */}
          <div className="flex flex-wrap items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800/50 gap-1">
            <button
              onClick={() => setActiveTab('simulador')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'simulador'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              Simulador
            </button>
            <button
              onClick={() => setActiveTab('disenador')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'disenador'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Diseñar Maniobra
            </button>
            <button
              onClick={() => setActiveTab('diagnostico')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'diagnostico'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Diagnóstico
            </button>
            <button
              onClick={() => setActiveTab('teoria')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'teoria'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Manual Teórico
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:text-rose-300 transition-colors rounded-lg cursor-pointer hover:bg-rose-500/10"
              title="Cerrar sesión de conductor"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome & Profile Intro */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" /> Registro Oficial UDAT Activo
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Evaluador de Maniobra Inversa y Comprensión Espacial
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                Hola, <span className="text-amber-400 font-bold">{session.name}</span>. Estás conduciendo bajo el perfil <span className="text-sky-400 font-bold">{session.profileType === 'P01' ? 'P01 - Sin Experiencia' : 'P02 - Con Experiencia'}</span>.
                {session.profileType === 'P01' 
                  ? ' El simulador te proporcionará guías extendidas y consejos de contravolante para que aprendas a contrarrestar el desvío geométrico.'
                  : ' Evaluaremos minuciosamente tu consistencia espacial, tiempo de respuesta, colisiones y la tendencia de control fino.'
                }
              </p>
            </div>

            <div className="md:col-span-4 bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-500" /> Ayuda al Conductor
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Usa el <strong className="text-slate-300">Diseñador de Maniobra</strong> para configurar tus propios espacios estrechos de estacionamiento y pon a prueba a otros operadores. Ve a la pestaña <strong className="text-slate-300">Diagnóstico</strong> para ver tu puntaje de comprensión.
              </p>
            </div>

          </div>

          {/* Decorative mesh background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        </div>

        {/* Dynamic Tab Panel */}
        <AnimatePresence mode="wait">
          {activeTab === 'simulador' && (
            <motion.div
              key="simulador"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
            >
              <TrailerSimulator 
                session={session} 
                onUpdateSession={handleUpdateSession}
                overrideChallenge={activeOverrideChallenge}
              />
            </motion.div>
          )}

          {activeTab === 'disenador' && (
            <motion.div
              key="disenador"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
            >
              <ManiobraEditor 
                onSaveChallenge={handleSaveChallenge}
                onSelectAndPlay={handleSelectAndPlayChallenge}
              />
            </motion.div>
          )}

          {activeTab === 'diagnostico' && (
            <motion.div
              key="diagnostico"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
            >
              <DiagnosticsPanel 
                session={session}
                onResetProgress={handleResetProgress}
              />
            </motion.div>
          )}

          {activeTab === 'teoria' && (
            <motion.div
              key="teoria"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
            >
              <TheorySection />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="border-t border-slate-900 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-slate-600" />
            <span>© 2026 Tráiler Reversa Lab. Desarrollado con fines educativos, de entrenamiento espacial y diagnóstico industrial.</span>
          </div>
          <div className="flex gap-4">
            <a 
              href="https://ai.studio/build" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-amber-500 transition-colors flex items-center gap-1"
            >
              Google AI Studio Build <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>

      </main>
    </div>
  );
}
