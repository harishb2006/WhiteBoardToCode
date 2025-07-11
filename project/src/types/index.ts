export type Tool = 'pen' | 'rectangle' | 'circle' | 'text' | 'select' | 'eraser';
export type Mode = 'code' | 'mentor';

export interface CanvasElement {
  id: string;
  type: 'path' | 'rectangle' | 'circle' | 'text';
  data: {
    points?: { x: number; y: number }[];
    text?: string;
    [key: string]: unknown;
  };
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  timestamp?: number;
  color?: string;
  strokeWidth?: number;
  fillColor?: string;
}

export interface HistoryState {
  elements: CanvasElement[];
  timestamp: number;
}

export interface WhiteboardSettings {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface MentorSession {
  id: string;
  topic: string;
  startTime: number;
  endTime?: number;
  elements: CanvasElement[];
  interactions: MentorInteraction[];
}

export interface MentorInteraction {
  id: string;
  timestamp: number;
  type: 'drawing' | 'question' | 'explanation' | 'note';
  content: string;
  elementIds?: string[];
  position?: { x: number; y: number };
}