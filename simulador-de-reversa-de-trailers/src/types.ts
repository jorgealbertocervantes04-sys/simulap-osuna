/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = 'Fácil' | 'Medio' | 'Difícil';

export type ObstacleType = 'cone' | 'wall' | 'dock_wall' | 'curb';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  angle?: number; // In radians for rotated walls
}

export interface TargetZone {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number; // In radians
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  instructions: string[];
  targetZone: TargetZone;
  obstacles: Obstacle[];
  startState: {
    x1: number;
    y1: number;
    theta1: number; // In radians
    theta2: number; // In radians
  };
  tip: string;
  successCondition: string; // Explanation of what to do
  isCustom?: boolean; // Indicates user created it
}

export interface VehicleConfig {
  tractorLength: number;
  tractorWidth: number;
  trailerLength: number;
  trailerWidth: number;
  wheelBase: number;
}

export interface SimulationState {
  x1: number; // Tractor rear center x
  y1: number; // Tractor rear center y
  theta1: number; // Tractor angle (radians)
  theta2: number; // Trailer angle (radians)
  steeringAngle: number; // Current front wheel steering angle (radians)
  velocity: number; // Current velocity
}

export interface TrailPoint {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  timestamp: number;
}

export type ProfileType = 'P01' | 'P02'; // P01: Sin experiencia, P02: Con experiencia

export interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  bestTime?: number; // in seconds
  collisions: number;
  jackknifes: number;
  completedAt?: number;
}

export interface SpatialComprehensionReport {
  matricula: string;
  profileType: ProfileType;
  collisionsTotal: number;
  jackknifesTotal: number;
  directionalErrors: number; // times steered opposite of intended correction
  reversesAttempted: number;
  totalTimeSeconds: number;
  score: number; // 0 to 100 comprehension score
  understandingStatus: 'Excelente' | 'Aceptable' | 'Regular (Alerta)' | 'Sin Comprensión Spacial (Crítico)';
  recommendation: string;
}

export interface UserSession {
  matricula: string;
  name: string;
  profileType: ProfileType;
  progress: ChallengeProgress[];
  customChallenges: Challenge[];
  diagnostics: SpatialComprehensionReport;
}
