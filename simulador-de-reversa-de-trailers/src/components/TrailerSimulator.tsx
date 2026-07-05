/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, HelpCircle, CheckCircle2, Eye, EyeOff, ShieldCheck, ShieldAlert, Award, ArrowUp, ArrowDown, ArrowLeftRight, Settings } from 'lucide-react';
import { Challenge, Obstacle, TargetZone, TrailPoint, VehicleConfig, UserSession } from '../types';

// Default Vehicle Configuration in Pixels
const DEFAULT_VEHICLE: VehicleConfig = {
  tractorLength: 46,
  tractorWidth: 22,
  trailerLength: 85, // medium length by default
  trailerWidth: 24,
  wheelBase: 32
};

// Available Trailer Length Options (Educational feature!)
const TRAILER_OPTIONS = [
  { id: 'short', name: 'Corto (Estilo Reparto)', length: 55, desc: 'Reacciona extremadamente rápido. ¡Dificultad alta!' },
  { id: 'medium', name: 'Estándar (Semi 40ft)', length: 85, desc: 'Comportamiento balanceado y realista.' },
  { id: 'long', name: 'Largo (Semi de 53ft)', length: 125, desc: 'Se mueve de forma lenta y predecible. Más fácil de guiar.' }
];

// Challenges Definitions
const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'straight',
    title: 'Desafío 1: Reversa en Línea Recta',
    description: 'Aprende a retroceder en línea recta manteniendo el tráiler centrado y alineado.',
    difficulty: 'Fácil',
    instructions: [
      'Gira el volante muy suavemente para corregir pequeños desvíos.',
      'Si el remolque se desvía a la IZQUIERDA, gira levemente a la IZQUIERDA para corregirlo.',
      'Estaciónate completamente dentro del muelle verde al final.'
    ],
    targetZone: {
      x: 160,
      y: 250,
      width: 110,
      height: 50,
      angle: Math.PI // Pointing left (tail-first into the dock)
    },
    obstacles: [
      // Upper lane cones
      { id: 'c1', type: 'cone', x: 240, y: 190, radius: 8 },
      { id: 'c2', type: 'cone', x: 320, y: 190, radius: 8 },
      { id: 'c3', type: 'cone', x: 400, y: 190, radius: 8 },
      { id: 'c4', type: 'cone', x: 480, y: 190, radius: 8 },
      { id: 'c5', type: 'cone', x: 560, y: 190, radius: 8 },
      { id: 'c6', type: 'cone', x: 640, y: 190, radius: 8 },
      // Lower lane cones
      { id: 'c7', type: 'cone', x: 240, y: 310, radius: 8 },
      { id: 'c8', type: 'cone', x: 320, y: 310, radius: 8 },
      { id: 'c9', type: 'cone', x: 400, y: 310, radius: 8 },
      { id: 'c10', type: 'cone', x: 480, y: 310, radius: 8 },
      { id: 'c11', type: 'cone', x: 560, y: 310, radius: 8 },
      { id: 'c12', type: 'cone', x: 640, y: 310, radius: 8 },
      // Back wall of dock
      { id: 'w1', type: 'dock_wall', x: 80, y: 170, width: 20, height: 160 }
    ],
    startState: {
      x1: 660,
      y1: 250,
      theta1: Math.PI,
      theta2: Math.PI
    },
    tip: 'El secreto es la anticipación: haz movimientos muy pequeños en el volante y regrésalo al centro rápido.',
    successCondition: 'Coloca el remolque alineado dentro del muelle y detén el camión por 1.5 segundos.'
  },
  {
    id: 'offset',
    title: 'Desafío 2: Acoplamiento de Desvío (Offset)',
    description: 'Retrocede de un carril al carril contiguo y estaciona alineado.',
    difficulty: 'Medio',
    instructions: [
      'Gira el volante a la DERECHA para que el remolque comience a desviarse hacia la IZQUIERDA.',
      'Sigue el remolque girando a la IZQUIERDA para estabilizar la curva.',
      'Endereza la unidad apuntando hacia el muelle inferior.'
    ],
    targetZone: {
      x: 160,
      y: 350,
      width: 110,
      height: 50,
      angle: Math.PI
    },
    obstacles: [
      // Upper lane boundary wall
      { id: 'w_up', type: 'wall', x: 100, y: 110, width: 620, height: 12 },
      // Middle block (forces them to maneuver)
      { id: 'c_mid1', type: 'cone', x: 340, y: 245, radius: 8 },
      { id: 'c_mid2', type: 'cone', x: 420, y: 245, radius: 8 },
      { id: 'c_mid3', type: 'cone', x: 500, y: 245, radius: 8 },
      { id: 'c_mid4', type: 'cone', x: 580, y: 245, radius: 8 },
      // Lower lane boundary wall
      { id: 'w_lo', type: 'wall', x: 100, y: 400, width: 620, height: 12 },
      // Back walls of the dock
      { id: 'dock_w', type: 'dock_wall', x: 80, y: 290, width: 20, height: 120 }
    ],
    startState: {
      x1: 650,
      y1: 175,
      theta1: Math.PI,
      theta2: Math.PI
    },
    tip: 'Usa el botón "Avanzar" para enderezar el tráiler si sientes que pierdes el control (un jalón hacia adelante salva la maniobra).',
    successCondition: 'Coloca el remolque alineado dentro del cajón de abajo y detente.'
  },
  {
    id: 'alley_dock',
    title: 'Desafío 3: Entrada a Muelle 90° (Alley Dock)',
    description: 'La maniobra reina de la conducción. Dobla a 90 grados marcha atrás en un muelle estrecho.',
    difficulty: 'Difícil',
    instructions: [
      'Inicia la marcha atrás girando a la IZQUIERDA para mandar el remolque hacia la DERECHA (hacia abajo).',
      'Monitorea el ángulo de articulación para evitar el efecto tijera (Jackknife).',
      'Realiza un jalón hacia adelante si necesitas enderezar antes de encajonar.'
    ],
    targetZone: {
      x: 215,
      y: 380,
      width: 50,
      height: 110,
      angle: Math.PI / 2 // Pointing down
    },
    obstacles: [
      // Street upper boundary cones (tight space)
      { id: 'su1', type: 'cone', x: 100, y: 215, radius: 8 },
      { id: 'su2', type: 'cone', x: 180, y: 215, radius: 8 },
      { id: 'su3', type: 'cone', x: 260, y: 215, radius: 8 },
      { id: 'su4', type: 'cone', x: 340, y: 215, radius: 8 },
      { id: 'su5', type: 'cone', x: 420, y: 215, radius: 8 },
      { id: 'su6', type: 'cone', x: 500, y: 215, radius: 8 },
      { id: 'su7', type: 'cone', x: 580, y: 215, radius: 8 },
      { id: 'su8', type: 'cone', x: 660, y: 215, radius: 8 },
      // Left dock wall
      { id: 'dl1', type: 'wall', x: 165, y: 285, width: 15, height: 150 },
      // Right dock wall
      { id: 'dl2', type: 'wall', x: 250, y: 285, width: 15, height: 150 },
      // Warehouse back wall
      { id: 'dl3', type: 'dock_wall', x: 100, y: 435, width: 200, height: 15 }
    ],
    startState: {
      x1: 520,
      y1: 150,
      theta1: Math.PI,
      theta2: Math.PI
    },
    tip: 'Debes iniciar el contravolante pronto, y luego girar fuerte en la dirección opuesta para encajonar la cabina enfrente del muelle.',
    successCondition: 'Estaciona el remolque verticalmente dentro del muelle 90°.'
  },
  {
    id: 'sandbox',
    title: 'Modo Libre (Área de Práctica)',
    description: 'Experimenta libremente con diferentes largos de remolque, velocidades y guías visuales.',
    difficulty: 'Fácil',
    instructions: [
      'Usa este modo para probar cómo afecta la longitud del tráiler a la reversa.',
      'Puedes desactivar colisiones si prefieres practicar sin interrupciones.',
      '¡Configura tu propio desafío!'
    ],
    targetZone: {
      x: 160,
      y: 250,
      width: 110,
      height: 50,
      angle: Math.PI
    },
    obstacles: [
      // Just simple corner guidelines and two cones to mark dock entrance
      { id: 'sc1', type: 'cone', x: 220, y: 195, radius: 8 },
      { id: 'sc2', type: 'cone', x: 220, y: 305, radius: 8 },
      { id: 'sb_w', type: 'dock_wall', x: 80, y: 170, width: 20, height: 160 }
    ],
    startState: {
      x1: 550,
      y1: 250,
      theta1: Math.PI,
      theta2: Math.PI
    },
    tip: 'Prueba la diferencia entre un remolque corto y uno largo. El remolque corto es increíblemente inestable.',
    successCondition: 'Estaciona en el muelle de la izquierda cuando desees.'
  }
];

interface TrailerSimulatorProps {
  session?: UserSession;
  onUpdateSession?: (session: UserSession) => void;
  overrideChallenge?: Challenge | null;
}

export default function TrailerSimulator({ session, onUpdateSession, overrideChallenge }: TrailerSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic set of challenges based on base challenges + user created ones + optional active override
  const [CHALLENGES, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);
  
  useEffect(() => {
    let list = [...DEFAULT_CHALLENGES];
    if (session?.customChallenges && session.customChallenges.length > 0) {
      list = [...list, ...session.customChallenges];
    }
    if (overrideChallenge) {
      // Avoid duplicate ids
      if (!list.some(c => c.id === overrideChallenge.id)) {
        list = [...list, overrideChallenge];
      }
    }
    setChallenges(list);
  }, [session?.customChallenges, overrideChallenge]);

  // Game state selection
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('straight');
  
  // Keep selected challenge in sync with overrideChallenge if passed
  useEffect(() => {
    if (overrideChallenge) {
      setSelectedChallengeId(overrideChallenge.id);
    }
  }, [overrideChallenge]);

  const [trailerLengthType, setTrailerLengthType] = useState<string>('medium');
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [disableCollisions, setDisableCollisions] = useState<boolean>(false);
  
  // Dynamic metrics synced to React for HUD
  const [jackknifeAngleDeg, setJackknifeAngleDeg] = useState<number>(0);
  const [isJackknifed, setIsJackknifed] = useState<boolean>(false);
  const [collisionDetected, setCollisionDetected] = useState<boolean>(false);
  const [collisionType, setCollisionType] = useState<string | null>(null);
  const [parkingProgress, setParkingProgress] = useState<number>(0); // 0 to 100%
  const [isChallengeSuccess, setIsChallengeSuccess] = useState<boolean>(false);
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});

  // Driving metrics for diagnostic tracking
  const [collisionsThisAttempt, setCollisionsThisAttempt] = useState<number>(0);
  const [jackknifesThisAttempt, setJackknifesThisAttempt] = useState<number>(0);
  const [directionalErrorsThisAttempt, setDirectionalErrorsThisAttempt] = useState<number>(0);
  const [showDirectionalErrorWarning, setShowDirectionalErrorWarning] = useState<boolean>(false);

  // Frame count to debouncing state incrementing
  const lastCollisionRef = useRef<number>(0);
  const lastJackknifeRef = useRef<number>(0);
  const consecutiveWrongSteerFramesRef = useRef<number>(0);
  const reverseStartedRef = useRef<boolean>(false);
  const levelStartTimeRef = useRef<number>(0);

  // Mobile/On-Screen Controllers
  const [pedalState, setPedalState] = useState<'forward' | 'reverse' | 'idle'>('idle');
  const [steerState, setSteerState] = useState<'left' | 'right' | 'idle'>('idle');

  // References for the high-performance physics loop to avoid stale React closures
  const activeChallenge = CHALLENGES.find(c => c.id === selectedChallengeId) || CHALLENGES[0];
  const activeTrailerConfig = TRAILER_OPTIONS.find(o => o.id === trailerLengthType) || TRAILER_OPTIONS[1];
  
  const physicsStateRef = useRef({
    x1: 0,
    y1: 0,
    theta1: 0,
    theta2: 0,
    steeringAngle: 0,
    targetSteeringAngle: 0,
    velocity: 0,
    parkingTimer: 0, // frame counter
    trail: [] as TrailPoint[],
    successTimer: 0
  });

  const requestRef = useRef<number | null>(null);

  // Initialize/Reset Vehicle State based on current challenge and configurations
  const resetSimulation = () => {
    const c = CHALLENGES.find(ch => ch.id === selectedChallengeId) || CHALLENGES[0];
    const length = selectedChallengeId === 'sandbox' 
      ? activeTrailerConfig.length 
      : DEFAULT_VEHICLE.trailerLength;

    physicsStateRef.current = {
      x1: c.startState.x1,
      y1: c.startState.y1,
      theta1: c.startState.theta1,
      theta2: c.startState.theta2,
      steeringAngle: 0,
      targetSteeringAngle: 0,
      velocity: 0,
      parkingTimer: 0,
      trail: [],
      successTimer: 0
    };

    setCollisionDetected(false);
    setCollisionType(null);
    setIsChallengeSuccess(false);
    setParkingProgress(0);
    setJackknifeAngleDeg(0);
    setIsJackknifed(false);

    // Reset attempt diagnostics
    setCollisionsThisAttempt(0);
    setJackknifesThisAttempt(0);
    setDirectionalErrorsThisAttempt(0);
    setShowDirectionalErrorWarning(false);
    consecutiveWrongSteerFramesRef.current = 0;
    reverseStartedRef.current = false;
    levelStartTimeRef.current = Date.now();
  };

  // Reset when level or trailer config changes
  useEffect(() => {
    resetSimulation();
  }, [selectedChallengeId, trailerLengthType, CHALLENGES]);

  // Report completed progress back to session
  useEffect(() => {
    if (isChallengeSuccess && session && onUpdateSession) {
      const timeTaken = Math.max(5, Math.round((Date.now() - levelStartTimeRef.current) / 1000));
      
      const newProgress = {
        challengeId: selectedChallengeId,
        completed: true,
        bestTime: timeTaken,
        collisions: collisionsThisAttempt,
        jackknifes: jackknifesThisAttempt,
        completedAt: Date.now()
      };

      let progressList = [...(session.progress || [])];
      const existingIdx = progressList.findIndex(p => p.challengeId === selectedChallengeId);
      
      if (existingIdx !== -1) {
        progressList[existingIdx] = {
          challengeId: selectedChallengeId,
          completed: true,
          bestTime: Math.min(progressList[existingIdx].bestTime || 9999, timeTaken),
          collisions: progressList[existingIdx].collisions + collisionsThisAttempt,
          jackknifes: progressList[existingIdx].jackknifes + jackknifesThisAttempt,
          completedAt: Date.now()
        };
      } else {
        progressList.push(newProgress);
      }

      const updatedDiagnostics = {
        ...session.diagnostics,
        collisionsTotal: session.diagnostics.collisionsTotal + collisionsThisAttempt,
        jackknifesTotal: session.diagnostics.jackknifesTotal + jackknifesThisAttempt,
        directionalErrors: session.diagnostics.directionalErrors + directionalErrorsThisAttempt,
        reversesAttempted: session.diagnostics.reversesAttempted + (reverseStartedRef.current ? 1 : 0),
        totalTimeSeconds: session.diagnostics.totalTimeSeconds + timeTaken
      };

      const updatedSession: UserSession = {
        ...session,
        progress: progressList,
        diagnostics: updatedDiagnostics
      };

      onUpdateSession(updatedSession);
    }
  }, [isChallengeSuccess]);

  // Handle keyboard keydown / keyup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight', 'Space'];
      if (keys.includes(e.code) || keys.includes(e.key)) {
        // Prevent default browser scrolling
        e.preventDefault();
      }
      setActiveKeys(prev => ({ ...prev, [e.code]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys(prev => ({ ...prev, [e.code]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Frame update loop (kinematics, collision, parking rules, and canvas drawing)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localFrameId: number;

    const updatePhysicsAndDraw = () => {
      const state = physicsStateRef.current;
      const c = CHALLENGES.find(ch => ch.id === selectedChallengeId) || CHALLENGES[0];
      
      // Determine actual trailer length based on settings
      const currentTrailerLength = selectedChallengeId === 'sandbox' 
        ? activeTrailerConfig.length 
        : DEFAULT_VEHICLE.trailerLength;

      // --- 1. USER INPUT READING ---
      let isAccelerating = activeKeys['KeyW'] || activeKeys['ArrowUp'] || pedalState === 'forward';
      let isReversing = activeKeys['KeyS'] || activeKeys['ArrowDown'] || pedalState === 'reverse';
      let isSteeringLeft = activeKeys['KeyA'] || activeKeys['ArrowLeft'] || steerState === 'left';
      let isSteeringRight = activeKeys['KeyD'] || activeKeys['ArrowRight'] || steerState === 'right';
      let isBraking = activeKeys['Space'];

      // --- 2. STEERING MECHANICS (Hydraulic feeling) ---
      const maxSteeringAngle = 36 * Math.PI / 180; // 36 degrees max lock
      if (isSteeringLeft) {
        state.targetSteeringAngle = -maxSteeringAngle;
      } else if (isSteeringRight) {
        state.targetSteeringAngle = maxSteeringAngle;
      } else {
        state.targetSteeringAngle = 0; // Self-centers
      }
      
      // Smooth interpolation for steering wheel turn rate
      state.steeringAngle += (state.targetSteeringAngle - state.steeringAngle) * 0.15;

      // --- 3. VELOCITY MECHANICS (Diesel truck torque feeling) ---
      const maxForwardSpeed = 1.2;
      const maxReverseSpeed = -0.8;
      const acceleration = 0.04;
      const deceleration = 0.08;

      if (isBraking) {
        state.velocity += (0 - state.velocity) * 0.25;
      } else if (isAccelerating && !isReversing) {
        state.velocity = Math.min(maxForwardSpeed, state.velocity + acceleration);
      } else if (isReversing && !isAccelerating) {
        state.velocity = Math.max(maxReverseSpeed, state.velocity - acceleration);
      } else {
        // Natural heavy engine rolling friction deceleration
        state.velocity += (0 - state.velocity) * deceleration;
      }

      // Stop dead if velocity gets extremely small
      if (Math.abs(state.velocity) < 0.01) {
        state.velocity = 0;
      }

      // If collided and trying to push further into collision, block movement
      if (collisionDetected && state.velocity !== 0) {
        // Let them escape by moving in the opposite direction
        const escaped = false; 
        // We handle this inside collision resolution below to keep it simple: we just reset speed on impact.
      }

      // --- 4. VEHICLE KINEMATICS ---
      const L1 = DEFAULT_VEHICLE.wheelBase; // Wheelbase
      const L2 = currentTrailerLength; // Trailer length

      // Save previous position to roll back on collision
      const prevX1 = state.x1;
      const prevY1 = state.y1;
      const prevTheta1 = state.theta1;
      const prevTheta2 = state.theta2;

      // Update Tractor rear center position & angle
      // Differential equation: dtheta1 = v * tan(steeringAngle) / L1
      if (state.velocity !== 0) {
        state.theta1 += (state.velocity * Math.tan(state.steeringAngle) / L1);
        
        // Keep angle normalized
        state.theta1 = (state.theta1 + Math.PI * 2) % (Math.PI * 2);

        state.x1 += state.velocity * Math.cos(state.theta1);
        state.y1 += state.velocity * Math.sin(state.theta1);

        // Update Trailer orientation
        // Differential equation: dtheta2 = v * sin(theta1 - theta2) / L2
        state.theta2 += (state.velocity * Math.sin(state.theta1 - state.theta2) / L2);
        state.theta2 = (state.theta2 + Math.PI * 2) % (Math.PI * 2);
      }

      // Normalize & calculate angle of articulation (Cab-Trailer Angle)
      let angleDiff = state.theta1 - state.theta2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      const jackknifeLimit = 85 * Math.PI / 180; // 85 degrees

      // Simulated mechanical bumper block: prevent rotating past jackknife limit physically!
      if (Math.abs(angleDiff) > jackknifeLimit) {
        const sign = Math.sign(angleDiff);
        state.theta2 = state.theta1 - sign * jackknifeLimit;
        if (!isJackknifed) {
          setIsJackknifed(true);
          if (Date.now() - lastJackknifeRef.current > 2500) {
            setJackknifesThisAttempt(prev => prev + 1);
            lastJackknifeRef.current = Date.now();
          }
        }
      } else {
        setIsJackknifed(false);
      }

      // Compute actual trailer rear axle position based on hitch and length
      const x2 = state.x1 - L2 * Math.cos(state.theta2);
      const y2 = state.y1 - L2 * Math.sin(state.theta2);

      // --- 5. COLLISION DETECTION AND RESOLUTION ---
      if (!disableCollisions && !isChallengeSuccess) {
        const check = checkCollision(state.x1, state.y1, state.theta1, state.theta2, L2, c.obstacles);
        if (check.collided) {
          setCollisionDetected(true);
          setCollisionType(check.type || 'obstáculo');
          
          if (Date.now() - lastCollisionRef.current > 2000) {
            setCollisionsThisAttempt(prev => prev + 1);
            lastCollisionRef.current = Date.now();
          }

          // Crash impact friction: instant stop
          state.velocity = 0;
          
          // Roloback coordinates slightly to prevent getting permanently stuck inside walls
          state.x1 = prevX1;
          state.y1 = prevY1;
          state.theta1 = prevTheta1;
          state.theta2 = prevTheta2;
        } else {
          setCollisionDetected(false);
          setCollisionType(null);
        }
      }

      // --- DIRECTIONAL ERROR (WRONG COUNTER-STEERING) CHECK ---
      if (state.velocity < -0.15) {
        reverseStartedRef.current = true;
        const isTrailerDriftingLeft = angleDiff < -0.08;
        const isTrailerDriftingRight = angleDiff > 0.08;
        const isSteeringRightWrongly = state.steeringAngle > 0.05;
        const isSteeringLeftWrongly = state.steeringAngle < -0.05;

        if ((isTrailerDriftingLeft && isSteeringRightWrongly) || (isTrailerDriftingRight && isSteeringLeftWrongly)) {
          if (consecutiveWrongSteerFramesRef.current >= 0) {
            consecutiveWrongSteerFramesRef.current += 1;
            if (consecutiveWrongSteerFramesRef.current > 75) {
              setDirectionalErrorsThisAttempt(prev => prev + 1);
              setShowDirectionalErrorWarning(true);
              consecutiveWrongSteerFramesRef.current = -120; // cooldown
              setTimeout(() => setShowDirectionalErrorWarning(false), 3000);
            }
          } else {
            consecutiveWrongSteerFramesRef.current += 1;
          }
        } else {
          if (consecutiveWrongSteerFramesRef.current > 0) {
            consecutiveWrongSteerFramesRef.current = 0;
          } else if (consecutiveWrongSteerFramesRef.current < 0) {
            consecutiveWrongSteerFramesRef.current += 1;
          }
        }
      }

      // Sync angle to gauge state
      const currentAngleDeg = Math.round(angleDiff * 180 / Math.PI);
      setJackknifeAngleDeg(currentAngleDeg);

      // Add trail point for tyre marks helper
      if (state.velocity !== 0 && Math.random() < 0.25) {
        state.trail.push({
          x1: state.x1,
          y1: state.y1,
          x2: state.x1 - L2 * Math.cos(state.theta2),
          y2: state.y1 - L2 * Math.sin(state.theta2),
          timestamp: Date.now()
        });
        // Limit trail history length
        if (state.trail.length > 150) state.trail.shift();
      }

      // --- 6. PARKING & ALIGNMENT SUCCESS CHECKS ---
      // Get the trailer center in world coordinates
      const trailerCenterX = state.x1 - (L2 / 2) * Math.cos(state.theta2);
      const trailerCenterY = state.y1 - (L2 / 2) * Math.sin(state.theta2);

      // Relative coordinates of trailer center to target zone center
      const dx = trailerCenterX - c.targetZone.x;
      const dy = trailerCenterY - c.targetZone.y;

      // Rotate target offset vector back to target zone orientation
      const targetCos = Math.cos(-c.targetZone.angle);
      const targetSin = Math.sin(-c.targetZone.angle);
      const localX = dx * targetCos - dy * targetSin;
      const localY = dx * targetSin + dy * targetCos;

      // Check boundary tolerances
      const insideX = Math.abs(localX) < c.targetZone.width / 2;
      const insideY = Math.abs(localY) < c.targetZone.height / 2;

      // Check alignment tolerance (within ~10 degrees)
      let targetAngleDiff = state.theta2 - c.targetZone.angle;
      while (targetAngleDiff > Math.PI) targetAngleDiff -= Math.PI * 2;
      while (targetAngleDiff < -Math.PI) targetAngleDiff += Math.PI * 2;
      
      const aligned = Math.abs(targetAngleDiff) < 0.15 || Math.abs(Math.abs(targetAngleDiff) - Math.PI) < 0.15;

      const isParkedCorrectly = insideX && insideY && aligned;

      if (isParkedCorrectly && !collisionDetected) {
        // Increment alignment timer (requires 1.5 seconds at 60fps ~ 90 frames)
        state.parkingTimer = Math.min(90, state.parkingTimer + 1);
        const progress = Math.round((state.parkingTimer / 90) * 100);
        setParkingProgress(progress);

        if (state.parkingTimer >= 90) {
          setIsChallengeSuccess(true);
        }
      } else {
        // Lose progress slowly if driver departs from target zone
        state.parkingTimer = Math.max(0, state.parkingTimer - 2);
        setParkingProgress(Math.round((state.parkingTimer / 90) * 100));
      }


      // --- 7. RENDERING STAGE ---
      // Clear Canvas
      ctx.fillStyle = '#0f172a'; // Deep slate dark ground
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid lines for depth perception
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw tire tracks trail
      if (showGuides) {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        state.trail.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x2, pt.y2);
          else ctx.lineTo(pt.x2, pt.y2);
        });
        ctx.stroke();
      }

      // Draw Target Zone (Pulsating Green Box)
      const pulse = 1 + Math.sin(Date.now() / 200) * 0.05;
      ctx.save();
      ctx.translate(c.targetZone.x, c.targetZone.y);
      ctx.rotate(c.targetZone.angle);
      
      // Dashed boundary
      ctx.strokeStyle = isParkedCorrectly ? '#10b981' : '#10b98188';
      ctx.lineWidth = isParkedCorrectly ? 3 : 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(-c.targetZone.width / 2, -c.targetZone.height / 2, c.targetZone.width, c.targetZone.height);
      
      // Soft fill
      ctx.fillStyle = isParkedCorrectly ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.06)';
      ctx.fillRect(-c.targetZone.width / 2, -c.targetZone.height / 2, c.targetZone.width, c.targetZone.height);
      
      // Center icon/label
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ZONA DE ACOPLE', 0, 3);
      
      ctx.restore();

      // Draw obstacles (Cones and Walls)
      c.obstacles.forEach(obs => {
        if (obs.type === 'cone') {
          // Orange safety cone base
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // White center stripe
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Tip
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Soft shadow
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.arc(obs.x + 3, obs.y + 3, 4, 0, Math.PI * 2);
          ctx.fill();

        } else if (obs.type === 'wall' || obs.type === 'dock_wall') {
          // Steel concrete wall bar
          const width = obs.width || 0;
          const height = obs.height || 0;
          
          // Shadow
          ctx.fillStyle = 'rgba(2, 6, 17, 0.5)';
          ctx.fillRect(obs.x + 4, obs.y + 4, width, height);

          // Wall fill
          ctx.fillStyle = obs.type === 'dock_wall' ? '#334155' : '#475569';
          ctx.fillRect(obs.x, obs.y, width, height);
          
          // Safety striped edges
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.strokeRect(obs.x, obs.y, width, height);
          
          // Draw hazard stripes on dock walls
          ctx.save();
          ctx.beginPath();
          ctx.rect(obs.x, obs.y, width, height);
          ctx.clip();
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 4;
          for (let k = obs.x - height; k < obs.x + width + height; k += 12) {
            ctx.beginPath();
            ctx.moveTo(k, obs.y);
            ctx.lineTo(k + height, obs.y + height);
            ctx.stroke();
          }
          ctx.restore();
        }
      });

      // --- TRAJECTORY PREDICTION GUIDES (Educational!) ---
      if (showGuides) {
        // 1. Trailer reverse vector ray
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        // Line starts from trailer rear center and extends backward
        const trailerBackX = state.x1 - L2 * Math.cos(state.theta2);
        const trailerBackY = state.y1 - L2 * Math.sin(state.theta2);
        ctx.moveTo(trailerBackX, trailerBackY);
        // Extend line 180px in backing direction
        ctx.lineTo(trailerBackX - 180 * Math.cos(state.theta2), trailerBackY - 180 * Math.sin(state.theta2));
        ctx.stroke();
        
        // Dynamic guide text
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.font = '8px monospace';
        ctx.fillText('RUMBO DE REMOLQUE', trailerBackX - 140 * Math.cos(state.theta2), trailerBackY - 140 * Math.sin(state.theta2) - 5);
        ctx.restore();

        // 2. Articulation visual arc linking tractor-trailer
        ctx.save();
        ctx.strokeStyle = Math.abs(angleDiff) < 0.6 ? '#10b98199' : Math.abs(angleDiff) < 1.1 ? '#f59e0b99' : '#ef444499';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(state.x1, state.y1, 28, state.theta1, state.theta2, angleDiff < 0);
        ctx.stroke();
        ctx.restore();
      }

      // --- VEHICLE DRAWING ---
      // Draw Trailer
      drawTrailer(ctx, state.x1, state.y1, x2, y2, state.theta2, L2);

      // Draw Tractor
      drawTractor(ctx, state.x1, state.y1, state.theta1, state.steeringAngle);

      // Request next frame
      localFrameId = requestAnimationFrame(updatePhysicsAndDraw);
    };

    localFrameId = requestAnimationFrame(updatePhysicsAndDraw);
    requestRef.current = localFrameId;

    return () => {
      if (localFrameId) cancelAnimationFrame(localFrameId);
    };
  }, [selectedChallengeId, trailerLengthType, showGuides, disableCollisions, pedalState, steerState, activeKeys, collisionDetected, isChallengeSuccess]);

  // SVG Tractor drawing helper inside local coordinate space
  const drawTractor = (ctx: CanvasRenderingContext2D, x1: number, y1: number, theta1: number, steeringAngle: number) => {
    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(theta1);

    // Chassis: -10 (back) to +36 (front)
    ctx.fillStyle = '#0f172a'; // wheel rims
    // Rear Dual Axles dual wheels
    ctx.fillRect(-8, -13, 11, 3);
    ctx.fillRect(-8, -10, 11, 3);
    ctx.fillRect(-8, 7, 11, 3);
    ctx.fillRect(-8, 10, 11, 3);

    // Fifth wheel (Hitch)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Steel frame beams
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, -7, 44, 4);
    ctx.fillRect(-12, 3, 44, 4);

    // Tractor Main Cabin Box
    ctx.fillStyle = '#0284c7'; // Solid blue cab body
    ctx.fillRect(0, -10, 22, 20);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, -10, 22, 20);

    // Engine hood front
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(22, -9, 14, 18);
    ctx.strokeRect(22, -9, 14, 18);

    // Windshield glass
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(15, -8, 3, 16);
    
    // Front wheels (Rotating!)
    // Left wheel
    ctx.save();
    ctx.translate(31, -11);
    ctx.rotate(steeringAngle);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5.5, -2, 11, 4);
    ctx.restore();

    // Right wheel
    ctx.save();
    ctx.translate(31, 11);
    ctx.rotate(steeringAngle);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5.5, -2, 11, 4);
    ctx.restore();

    // Cabin roof shadow detail
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(3, -7, 8, 14);

    ctx.restore();
  };

  // SVG Trailer drawing helper inside local coordinate space
  const drawTrailer = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, theta2: number, length: number) => {
    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(theta2);

    // Main aluminum box body: from front overhang (+8) to back axle (-length) and rear bumper (-length - 12)
    // Draw underside frame first
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-length - 5, -9, length + 5, 18);

    // Draw main white dry van body
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.fillRect(-length - 12, -11, length + 20, 22);
    ctx.strokeRect(-length - 12, -11, length + 20, 22);

    // Elegant corrugated aesthetic siding lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    for (let pos = -length - 6; pos < 5; pos += 14) {
      ctx.beginPath();
      ctx.moveTo(pos, -10);
      ctx.lineTo(pos, 10);
      ctx.stroke();
    }

    // Rear Dual Axles and tires (placed around -length)
    ctx.fillStyle = '#020617';
    // Axle 1
    ctx.fillRect(-length - 7, -13.5, 9, 3);
    ctx.fillRect(-length - 7, 10.5, 9, 3);
    // Axle 2 (Tandem configuration for high-fidelity trucks!)
    ctx.fillRect(-length + 4, -13.5, 9, 3);
    ctx.fillRect(-length + 4, 10.5, 9, 3);

    // Bumper mudflaps
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-length - 12.5, -11, 0.8, 22);

    // Safety Red/White high-contrast stripes at the rear bumper
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-length - 12, -11, 1.5, 22);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-length - 12, -7, 1.5, 3);
    ctx.fillRect(-length - 12, 4, 1.5, 3);

    // Kingpin hitch coupler at (0, 0)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Helper box-circle and circle-AABB checks
  const checkCollision = (
    x1: number, y1: number, theta1: number,
    theta2: number, length: number,
    obstacles: Obstacle[]
  ) => {
    // 1. Tractor spine collision spheres
    const tractorRadius = 9.5;
    const tractorSamples = [
      { x: x1, y: y1 }, // rear coupling
      { x: x1 + 16 * Math.cos(theta1), y: y1 + 16 * Math.sin(theta1) }, // center
      { x: x1 + 32 * Math.cos(theta1), y: y1 + 32 * Math.sin(theta1) }  // front bumper
    ];

    // 2. Trailer spine collision spheres
    const trailerRadius = 11;
    const numTrailerSamples = Math.ceil(length / 15);
    const trailerSamples: { x: number, y: number }[] = [];
    for (let i = 0; i <= numTrailerSamples; i++) {
      const d = (i / numTrailerSamples) * (length + 8);
      trailerSamples.push({
        x: x1 - d * Math.cos(theta2),
        y: y1 - d * Math.sin(theta2)
      });
    }

    // 3. Arena Boundaries (Canvas sizes: 800 x 500)
    const bounds = { w: 800, h: 500, margin: 12 };
    for (const p of [...tractorSamples, ...trailerSamples]) {
      const r = p === tractorSamples[0] ? tractorRadius : trailerRadius;
      if (
        p.x < r + bounds.margin || 
        p.x > bounds.w - r - bounds.margin || 
        p.y < r + bounds.margin || 
        p.y > bounds.h - r - bounds.margin
      ) {
        return { collided: true, type: 'borde del mapa' };
      }
    }

    // 4. Custom Obstacles
    for (const obs of obstacles) {
      if (obs.type === 'cone') {
        const coneRadius = obs.radius || 7;
        const cx = obs.x;
        const cy = obs.y;

        // Tractor overlap
        for (const p of tractorSamples) {
          const distSq = (p.x - cx) ** 2 + (p.y - cy) ** 2;
          if (distSq < (tractorRadius + coneRadius) ** 2) {
            return { collided: true, type: 'cono de seguridad', id: obs.id };
          }
        }

        // Trailer overlap
        for (const p of trailerSamples) {
          const distSq = (p.x - cx) ** 2 + (p.y - cy) ** 2;
          if (distSq < (trailerRadius + coneRadius) ** 2) {
            return { collided: true, type: 'cono de seguridad', id: obs.id };
          }
        }
      } else if (obs.type === 'wall' || obs.type === 'dock_wall' || obs.type === 'curb') {
        const left = obs.x;
        const top = obs.y;
        const right = obs.x + (obs.width || 0);
        const bottom = obs.y + (obs.height || 0);

        // Tractor overlap
        for (const p of tractorSamples) {
          const closestX = Math.max(left, Math.min(p.x, right));
          const closestY = Math.max(top, Math.min(p.y, bottom));
          const distSq = (p.x - closestX) ** 2 + (p.y - closestY) ** 2;
          if (distSq < tractorRadius ** 2) {
            return { collided: true, type: obs.type === 'dock_wall' ? 'muelle' : 'muro', id: obs.id };
          }
        }

        // Trailer overlap
        for (const p of trailerSamples) {
          const closestX = Math.max(left, Math.min(p.x, right));
          const closestY = Math.max(top, Math.min(p.y, bottom));
          const distSq = (p.x - closestX) ** 2 + (p.y - closestY) ** 2;
          if (distSq < trailerRadius ** 2) {
            return { collided: true, type: obs.type === 'dock_wall' ? 'muelle' : 'muro', id: obs.id };
          }
        }
      }
    }

    return { collided: false };
  };

  // Helper to color articulation gauge based on danger
  const getAngleGaugeColor = (angle: number) => {
    const abs = Math.abs(angle);
    if (abs < 30) return '#10b981'; // safe green
    if (abs < 60) return '#f59e0b'; // caution yellow
    return '#ef4444'; // critical jackknife red
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header / Controls Dashboard */}
      <div className="grid md:grid-cols-12 gap-4 items-center bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        
        {/* Challenge Selection */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Selecciona una Misión
          </label>
          <select
            value={selectedChallengeId}
            onChange={(e) => setSelectedChallengeId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            {CHALLENGES.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.title} ({ch.difficulty})
              </option>
            ))}
          </select>
        </div>

        {/* Sandbox customization details */}
        {selectedChallengeId === 'sandbox' ? (
          <div className="md:col-span-4 space-y-1.5 animate-fade-in">
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-amber-400" /> Largo de Remolque
            </label>
            <select
              value={trailerLengthType}
              onChange={(e) => setTrailerLengthType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              {TRAILER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="md:col-span-4 self-center pt-2">
            <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <span className={`px-2 py-0.5 rounded font-bold ${
                activeChallenge.difficulty === 'Fácil' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : activeChallenge.difficulty === 'Medio'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {activeChallenge.difficulty}
              </span>
              <p className="text-slate-400 font-sans leading-tight">Configuración de tráiler fija por desafío.</p>
            </div>
          </div>
        )}

        {/* Simulation Toggles */}
        <div className="md:col-span-3 flex md:flex-col justify-between gap-2">
          {/* Guides toggle */}
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
              showGuides 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25 shadow-sm shadow-indigo-500/5' 
                : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:text-slate-200'
            }`}
          >
            {showGuides ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showGuides ? 'Guías: Activadas' : 'Guías: Desactivadas'}
          </button>

          {/* Collisions toggle (Only in Sandbox) */}
          <button
            onClick={() => {
              if (selectedChallengeId === 'sandbox') {
                setDisableCollisions(!disableCollisions);
              }
            }}
            disabled={selectedChallengeId !== 'sandbox'}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
              selectedChallengeId !== 'sandbox'
                ? 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-500 border-slate-800/50'
                : disableCollisions
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:text-slate-200 cursor-pointer'
            }`}
            title={selectedChallengeId !== 'sandbox' ? 'Disponible solo en Modo Libre' : ''}
          >
            {disableCollisions ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            {disableCollisions ? 'Chocar: Desactivado' : 'Chocar: Activado'}
          </button>
        </div>
      </div>

      {/* Main Simulator & Gauge Screen */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Canvas Arena Panel (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Real-time Indicator Banners */}
            {/* Jackknife Alert */}
            {isJackknifed && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-rose-500/90 text-white font-mono font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-lg animate-pulse border border-rose-400">
                <ShieldAlert className="w-4 h-4" /> ¡ENGANCHE BLOQUEADO / TIJERA!
              </div>
            )}

            {/* Directional Error Alert for Inexperienced (P01) or general */}
            {showDirectionalErrorWarning && (
              <div className="absolute top-16 left-4 z-10 flex flex-col gap-1 bg-amber-500 text-slate-950 font-sans font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg border border-amber-400 max-w-sm animate-bounce">
                <div className="flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 shrink-0" /> Volante Incorrecto
                </div>
                <p className="text-[10px] text-slate-900 font-medium normal-case leading-tight">
                  Estás girando el volante en el sentido equivocado para corregir la deriva. Sigue el remolque (regla del contravolante).
                </p>
              </div>
            )}

            {/* Collision alert */}
            {collisionDetected && (
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 items-end bg-rose-950/90 border border-rose-500 text-rose-200 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-sm">
                <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Colisión con {collisionType}
                </span>
                <span className="text-[10px] text-rose-300">Avanza hacia adelante o presiona "Resetear"</span>
              </div>
            )}

            {/* Live Attempt Metrics HUD */}
            <div className="absolute bottom-4 right-4 z-10 bg-slate-950/85 backdrop-blur-sm border border-slate-800/80 p-3 rounded-xl shadow-lg flex gap-4 text-[10px] font-mono text-slate-400">
              <div>Colisiones: <span className="text-rose-400 font-bold">{collisionsThisAttempt}</span></div>
              <div>Tijeras: <span className="text-amber-400 font-bold">{jackknifesThisAttempt}</span></div>
              <div>Errores de Giro: <span className="text-indigo-400 font-bold">{directionalErrorsThisAttempt}</span></div>
            </div>

            {/* Parking Alignment Progress */}
            {parkingProgress > 0 && !isChallengeSuccess && (
              <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-950/90 backdrop-blur-sm border border-emerald-500/40 p-4 rounded-xl shadow-2xl max-w-sm mx-auto">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Acoplamiento Perfecto
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{parkingProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-75"
                    style={{ width: `${parkingProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">¡Mantén el camión detenido y alineado para completar!</p>
              </div>
            )}

            {/* Success Modal Overlay */}
            {isChallengeSuccess && (
              <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center animate-fade-in backdrop-blur-sm">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/5">
                  <Award className="w-9 h-9 animate-bounce" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">¡Misión Cumplida!</h3>
                <p className="text-slate-300 text-sm max-w-md leading-relaxed mb-6">
                  Lograste posicionar la unidad articulada de forma impecable en la zona de acople del muelle. ¡Dominas las geometrías de reversa!
                </p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={resetSimulation}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Intentar de Nuevo
                  </button>
                  {selectedChallengeId !== 'sandbox' && (
                    <button
                      onClick={() => {
                        const idx = CHALLENGES.findIndex(ch => ch.id === selectedChallengeId);
                        if (idx !== -1 && idx < CHALLENGES.length - 1) {
                          setSelectedChallengeId(CHALLENGES[idx + 1].id);
                        } else {
                          setSelectedChallengeId('sandbox');
                        }
                      }}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-bold cursor-pointer transition-colors shadow-lg shadow-amber-500/15"
                    >
                      Siguiente Desafío <ArrowLeftRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Interactive Canvas */}
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full block aspect-[8/5] touch-none bg-slate-950"
            />
            
            {/* Help Overlay / Tip */}
            <div className="absolute top-4 left-4 z-0 pointer-events-none text-[11px] font-mono text-slate-500 bg-slate-950/40 p-2 rounded-lg">
              800 x 500 px | {activeTrailerConfig.name}
            </div>
          </div>

          {/* Quick HUD guide controls explanation */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-300 font-sans">Controles de Teclado</h4>
              <div className="flex gap-3 text-[11px] text-slate-400">
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono text-xs">W</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono text-xs">▲</kbd> Avanzar</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono text-xs">S</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono text-xs">▼</kbd> Reversa</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono text-xs">A</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono text-xs">◀</kbd> Girar Izq</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono text-xs">D</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono text-xs">▶</kbd> Girar Der</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white font-mono text-xs">Space</kbd> Frenar</span>
              </div>
            </div>

            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Resetear Camión
            </button>
          </div>
        </div>

        {/* Articulation Gauge & Mission Objectives (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Mission details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-1">Misión Actual</span>
              <h3 className="text-base font-bold text-slate-100">{activeChallenge.title}</h3>
              <p className="text-slate-400 text-xs mt-1 leading-normal">{activeChallenge.description}</p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Instrucciones de Maniobra</span>
              <ul className="space-y-2">
                {activeChallenge.instructions.map((inst, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-xs text-slate-300 leading-normal">
                    <span className="w-4.5 h-4.5 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center font-mono text-[10px] text-amber-400 font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10 text-xs leading-relaxed text-slate-400">
              <span className="font-semibold text-amber-400 block mb-0.5">Tip Profesional:</span>
              {activeChallenge.tip}
            </div>
          </div>

          {/* Dynamic Articulation Gauge Dashboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Ángulo de Articulación</span>
            
            <div className="flex flex-col items-center justify-center py-2">
              {/* Articulation Gauge Dial SVG */}
              <div className="relative w-36 h-20 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 50">
                  {/* Gauge Arc Background */}
                  <path d="M 10 45 A 40 40 0 0 1 90 45" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                  
                  {/* Gauge Danger sections */}
                  {/* Safe Zone (center green) */}
                  <path d="M 33 21 A 40 40 0 0 1 67 21" fill="none" stroke="#10b981" strokeWidth="6" />
                  {/* Left Warning Zone (yellow) */}
                  <path d="M 20 31 A 40 40 0 0 1 33 21" fill="none" stroke="#f59e0b" strokeWidth="6" />
                  {/* Right Warning Zone (yellow) */}
                  <path d="M 67 21 A 40 40 0 0 1 80 31" fill="none" stroke="#f59e0b" strokeWidth="6" />
                  {/* Left Jackknife Zone (red) */}
                  <path d="M 10 45 A 40 40 0 0 1 20 31" fill="none" stroke="#ef4444" strokeWidth="6" />
                  {/* Right Jackknife Zone (red) */}
                  <path d="M 80 31 A 40 40 0 0 1 90 45" fill="none" stroke="#ef4444" strokeWidth="6" />

                  {/* Indicator Needle */}
                  {/* Map angle (-90deg to +90deg) to (0 to 180deg) */}
                  {/* 0 deg is pointing straight (up) => 90 deg gauge rotation */}
                  <g transform={`translate(50, 45) rotate(${jackknifeAngleDeg})`}>
                    <line x1="0" y1="0" x2="0" y2="-38" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
                    <polygon points="0,-41 -3,-35 3,-35" fill="#f8fafc" />
                    <circle cx="0" cy="0" r="3" fill="#f8fafc" />
                  </g>
                </svg>

                {/* Overlaid absolute angle readout */}
                <div className="absolute bottom-0 inset-x-0 text-center">
                  <span className="text-lg font-mono font-black" style={{ color: getAngleGaugeColor(jackknifeAngleDeg) }}>
                    {jackknifeAngleDeg}°
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block uppercase">Ángulo de Cabina</span>
                </div>
              </div>

              {/* Status Indicator text badge */}
              <div className="mt-3 text-center">
                {Math.abs(jackknifeAngleDeg) < 30 ? (
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md text-xs font-bold uppercase tracking-wider">
                    Línea Segura
                  </span>
                ) : Math.abs(jackknifeAngleDeg) < 60 ? (
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-md text-xs font-bold uppercase tracking-wider animate-pulse">
                    Peligro de Tijera
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-md text-xs font-bold uppercase tracking-wider animate-bounce">
                    ¡Jackknife Crítico!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Touch Pedals & Steering Controllers HUD (Extremely important for Tablet/Mobile/Mouse learners!) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <ArrowLeftRight className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">Panel de Control Táctil (Simulado)</h4>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Virtual Steering Wheel controls */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block text-center md:text-left">Dirección (Volante)</span>
            <div className="flex gap-2 items-center justify-center">
              <button
                onMouseDown={() => setSteerState('left')}
                onMouseUp={() => setSteerState('idle')}
                onMouseLeave={() => setSteerState('idle')}
                onTouchStart={(e) => { e.preventDefault(); setSteerState('left'); }}
                onTouchEnd={() => setSteerState('idle')}
                className={`flex-1 max-w-[120px] py-4 rounded-xl font-bold text-sm cursor-pointer border select-none transition-all ${
                  steerState === 'left'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-95'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                ◀ Izquierda (A)
              </button>

              <button
                onClick={() => {
                  const state = physicsStateRef.current;
                  state.steeringAngle = 0;
                  state.targetSteeringAngle = 0;
                }}
                className="px-3.5 py-4 bg-slate-950 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Centrar
              </button>

              <button
                onMouseDown={() => setSteerState('right')}
                onMouseUp={() => setSteerState('idle')}
                onMouseLeave={() => setSteerState('idle')}
                onTouchStart={(e) => { e.preventDefault(); setSteerState('right'); }}
                onTouchEnd={() => setSteerState('idle')}
                className={`flex-1 max-w-[120px] py-4 rounded-xl font-bold text-sm cursor-pointer border select-none transition-all ${
                  steerState === 'right'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-95'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                Derecha (D) ➡️
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center leading-tight">
              Para girar el remolque a la izquierda, gira el volante a la <strong className="text-slate-400">derecha</strong> (contravolante).
            </p>
          </div>

          {/* Virtual Pedal Controls */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block text-center md:text-left">Caja de Cambios y Aceleración</span>
            <div className="flex gap-2 justify-center md:justify-start">
              <button
                onMouseDown={() => setPedalState('forward')}
                onMouseUp={() => setPedalState('idle')}
                onMouseLeave={() => setPedalState('idle')}
                onTouchStart={(e) => { e.preventDefault(); setPedalState('forward'); }}
                onTouchEnd={() => setPedalState('idle')}
                className={`flex-1 py-4 max-w-[120px] rounded-xl font-bold text-xs cursor-pointer border uppercase tracking-wider select-none transition-all ${
                  pedalState === 'forward'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-95'
                    : 'bg-slate-950 text-blue-400 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <ArrowUp className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                Avanzar (W)
              </button>

              <button
                onMouseDown={() => {
                  const state = physicsStateRef.current;
                  state.velocity = 0;
                }}
                className="px-4 py-4 bg-red-950/20 hover:bg-red-900/30 text-rose-400 border border-red-900/40 rounded-xl text-xs font-bold cursor-pointer uppercase tracking-wider"
              >
                Parar (Espacio)
              </button>

              <button
                onMouseDown={() => setPedalState('reverse')}
                onMouseUp={() => setPedalState('idle')}
                onMouseLeave={() => setPedalState('idle')}
                onTouchStart={(e) => { e.preventDefault(); setPedalState('reverse'); }}
                onTouchEnd={() => setPedalState('idle')}
                className={`flex-1 py-4 max-w-[120px] rounded-xl font-bold text-xs cursor-pointer border uppercase tracking-wider select-none transition-all ${
                  pedalState === 'reverse'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg scale-95'
                    : 'bg-slate-950 text-rose-400 border-slate-800 hover:bg-slate-800/60'
                }`}
              >
                <ArrowDown className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                Reversa (S)
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center md:text-left leading-tight">
              Avanza un poco hacia adelante (jalón) si el ángulo es crítico y necesitas enderezar tu remolque.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
