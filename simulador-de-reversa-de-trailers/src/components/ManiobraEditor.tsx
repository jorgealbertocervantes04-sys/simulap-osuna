/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, Play, Settings, Compass, HelpCircle, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { Challenge, Obstacle, TargetZone } from '../types';

interface ManiobraEditorProps {
  onSaveChallenge: (challenge: Challenge) => void;
  onSelectAndPlay: (challenge: Challenge) => void;
}

export default function ManiobraEditor({ onSaveChallenge, onSelectAndPlay }: ManiobraEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [title, setTitle] = useState('Mi Maniobra Personalizada');
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Medio' | 'Difícil'>('Medio');
  
  // Placement active tool
  const [activeTool, setActiveTool] = useState<'cone' | 'wall' | 'target' | 'start'>('cone');
  
  // Custom obstacle list
  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { id: 'c1', type: 'cone', x: 300, y: 200, radius: 8 },
    { id: 'c2', type: 'cone', x: 300, y: 300, radius: 8 }
  ]);
  
  // Target dock zone
  const [targetZone, setTargetZone] = useState<TargetZone>({
    x: 160,
    y: 250,
    width: 110,
    height: 50,
    angle: Math.PI
  });

  // Start state coordinate
  const [startState, setStartState] = useState({
    x1: 600,
    y1: 250,
    theta1: Math.PI,
    theta2: Math.PI
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Dynamic values for rotation sliders
  const [selectedWallIndex, setSelectedWallIndex] = useState<number | null>(null);
  const [targetAngleDeg, setTargetAngleDeg] = useState(180);

  // Redraw preview layout on changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#0f172a'; // Same background color as simulation
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const spacing = 40;
    for (let x = 0; x < canvas.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Target Zone
    ctx.save();
    ctx.translate(targetZone.x, targetZone.y);
    ctx.rotate(targetZone.angle);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-targetZone.width / 2, -targetZone.height / 2, targetZone.width, targetZone.height);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fillRect(-targetZone.width / 2, -targetZone.height / 2, targetZone.width, targetZone.height);
    ctx.restore();

    // Draw Obstacles
    obstacles.forEach((obs, idx) => {
      if (obs.type === 'cone') {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'wall') {
        ctx.fillStyle = '#475569';
        ctx.fillRect(obs.x - 15, obs.y - 15, 30, 30);
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(obs.x - 15, obs.y - 15, 30, 30);
      }
    });

    // Draw Truck Starting Position
    ctx.save();
    ctx.translate(startState.x1, startState.y1);
    ctx.rotate(startState.theta1);
    
    // Tractor
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, -10, 22, 20);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(15, -8, 3, 16); // windshield
    
    // Hitch connector
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // Trailer
    ctx.save();
    ctx.rotate(startState.theta2 - startState.theta1);
    ctx.fillStyle = 'rgba(241, 245, 249, 0.6)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.fillRect(-85, -11, 85, 22);
    ctx.strokeRect(-85, -11, 85, 22);
    ctx.restore();

    ctx.restore();

    // Draw Editor overlay instructions
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(10, 10, 240, 26);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText(`HERRAMIENTA ACTIVA: ${activeTool.toUpperCase()}`, 15, 26);

  }, [obstacles, targetZone, startState, activeTool]);

  // Handle canvas clicks to place or move elements
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Scale click coords based on canvas dimension settings
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);

    if (activeTool === 'cone') {
      const newCone: Obstacle = {
        id: `custom_c_${Date.now()}`,
        type: 'cone',
        x: clickX,
        y: clickY,
        radius: 8
      };
      setObstacles(prev => [...prev, newCone]);
    } else if (activeTool === 'wall') {
      const newWall: Obstacle = {
        id: `custom_w_${Date.now()}`,
        type: 'wall',
        x: clickX - 25,
        y: clickY - 10,
        width: 50,
        height: 20
      };
      setObstacles(prev => [...prev, newWall]);
    } else if (activeTool === 'target') {
      setTargetZone(prev => ({
        ...prev,
        x: clickX,
        y: clickY
      }));
    } else if (activeTool === 'start') {
      setStartState(prev => ({
        ...prev,
        x1: clickX,
        y1: clickY
      }));
    }
  };

  const handleClear = () => {
    setObstacles([]);
  };

  const handleRotateTarget = (deg: number) => {
    setTargetAngleDeg(deg);
    setTargetZone(prev => ({
      ...prev,
      angle: (deg * Math.PI) / 180
    }));
  };

  const handleSave = () => {
    const customChallenge: Challenge = {
      id: `custom_${Date.now()}`,
      title: title || 'Muelle Personalizado',
      description: 'Maniobra de reversa con un muelle de acoplamiento personalizado diseñado por ti.',
      difficulty,
      instructions: [
        'Alinea la unidad articulada con tu muelle diseñado.',
        'Retrocede prestando atención a los obstáculos personalizados.',
        'Completa el acoplamiento deteniéndote en la zona verde.'
      ],
      targetZone,
      obstacles,
      startState,
      tip: 'Prueba a acomodar el tractor primero en una curva suave antes de entrar en reversa pura.',
      successCondition: 'Estaciona el remolque dentro del muelle personalizado.',
      isCustom: true
    };

    onSaveChallenge(customChallenge);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-sans text-slate-100">Estudio de Diseño de Maniobras</h2>
            <p className="text-slate-400 text-sm">Crea tu propio muelle, distribuye obstáculos y pon a prueba tus habilidades</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Interactive Editor Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
            
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onClick={handleCanvasClick}
              className="w-full block aspect-[8/5] bg-slate-950 cursor-crosshair"
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 border border-slate-800/80 p-3 rounded-xl flex justify-between items-center text-xs text-slate-400">
              <span>💡 <strong className="text-slate-200">Haz clic en el mapa</strong> para colocar el objeto de la herramienta activa.</span>
              <button 
                onClick={handleClear}
                className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpiar Arena
              </button>
            </div>
          </div>

          {/* Setup controls */}
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Título del Escenario
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Muelle de Acople Estrecho"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Dificultad Estimada
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
              >
                <option value="Fácil">Fácil</option>
                <option value="Medio">Medio</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>

          </div>
        </div>

        {/* Toolbox sidebar controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Tool Selector */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">
              Herramientas de Colocación
            </span>
            
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'cone', label: 'Cono de Tránsito', desc: 'Obstáculo pequeño', color: 'border-orange-500/20 text-orange-400 bg-orange-500/5' },
                { id: 'wall', label: 'Bloque de Muro', desc: 'Obstáculo de concreto', color: 'border-slate-700/50 text-slate-300 bg-slate-800/20' },
                { id: 'target', label: 'Zona de Acople', desc: 'Muelle de destino', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
                { id: 'start', label: 'Inicio del Camión', desc: 'Punto de spawn', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' }
              ].map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[85px] ${
                      isActive 
                        ? 'border-sky-500 bg-sky-500/10 text-white shadow-lg shadow-sky-500/5' 
                        : `${tool.color} opacity-75 hover:opacity-100`
                    }`}
                  >
                    <span className="text-xs font-bold font-sans leading-tight">{tool.label}</span>
                    <span className="text-[9px] text-slate-400 leading-normal">{tool.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Properties adjustments */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">
              Ajustes de Orientación
            </span>
            
            {/* Rotate target zone */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Giro del Muelle</span>
                <span className="font-mono text-emerald-400 font-bold">{targetAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={targetAngleDeg}
                onChange={(e) => handleRotateTarget(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Determina de qué dirección entra en reversa la cabina articulada.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            
            {savedSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs flex gap-2 items-center justify-center animate-bounce">
                <CheckCircle2 className="w-4 h-4" /> ¡Guardado correctamente en tu sesión!
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4.5 h-4.5" />
              Guardar Escenario en Mi Perfil
            </button>

            <button
              onClick={() => {
                const customChallenge: Challenge = {
                  id: `custom_temp_${Date.now()}`,
                  title,
                  description: 'Nivel creado por usuario',
                  difficulty,
                  instructions: ['Maniobra y estaciónate en el muelle que diseñaste.'],
                  targetZone,
                  obstacles,
                  startState,
                  tip: '¡Alinea con cuidado!',
                  successCondition: 'Estaciónate con éxito.',
                  isCustom: true
                };
                onSelectAndPlay(customChallenge);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4.5 h-4.5 fill-slate-950" />
              Probar Escenario Ahora
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
