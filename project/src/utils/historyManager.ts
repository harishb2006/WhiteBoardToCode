import { CanvasElement, HistoryState } from '../types';

class HistoryManager {
  private history: HistoryState[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50;

  constructor(maxSize = 50) {
    this.maxHistorySize = maxSize;
  }

  addState(elements: CanvasElement[]): void {
    // Remove any history after current index (when we add after undo)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new state
    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(elements)), // Deep clone
      timestamp: Date.now()
    };
    
    this.history.push(newState);
    this.currentIndex++;
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(): CanvasElement[] | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return [...this.history[this.currentIndex].elements];
    }
    return null;
  }

  redo(): CanvasElement[] | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return [...this.history[this.currentIndex].elements];
    }
    return null;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  getCurrentState(): CanvasElement[] | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return [...this.history[this.currentIndex].elements];
    }
    return null;
  }

  getHistorySize(): number {
    return this.history.length;
  }
}

export default HistoryManager;
