export type Tool = 'pen' | 'rectangle' | 'circle' | 'text' | 'select';

export interface CanvasElement {
  id: string;
  type: 'path' | 'rectangle' | 'circle' | 'text';
  data: any;
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}