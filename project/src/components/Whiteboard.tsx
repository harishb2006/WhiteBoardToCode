import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { CanvasElement, Tool, WhiteboardSettings } from '../types';

interface WhiteboardProps {
  selectedTool: Tool;
  onElementsChange: (elements: CanvasElement[]) => void;
  settings: WhiteboardSettings;
}

export interface WhiteboardRef {
  clearCanvas: () => void;
  getCanvasRef: () => HTMLCanvasElement | null;
  getElements: () => CanvasElement[];
  getCanvasDimensions: () => { width: number; height: number };
  addElement: (element: CanvasElement) => void;
}

const Whiteboard = forwardRef<WhiteboardRef, WhiteboardProps>(({ selectedTool, onElementsChange, settings }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  const clearCanvas = () => {
    setElements([]);
    setCurrentPath([]);
    onElementsChange([]);
  };

  const addElement = (element: CanvasElement) => {
    const newElements = [...elements, element];
    setElements(newElements);
    onElementsChange(newElements);
  };

  useImperativeHandle(ref, () => ({
    clearCanvas,
    getCanvasRef: () => canvasRef.current,
    getElements: () => elements,
    getCanvasDimensions: () => {
      const canvas = canvasRef.current;
      if (!canvas) return { width: 0, height: 0 };
      const rect = canvas.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    },
    addElement
  }));

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.strokeStyle = element.color || settings.strokeColor;
    ctx.lineWidth = element.strokeWidth || settings.strokeWidth;
    ctx.fillStyle = element.fillColor || settings.fillColor;

    switch (element.type) {
      case 'path':
        if (element.data.points && element.data.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.data.points[0].x, element.data.points[0].y);
          element.data.points.slice(1).forEach((point: { x: number; y: number }) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;
      case 'rectangle': {
        const rectWidth = element.dimensions?.width || 100;
        const rectHeight = element.dimensions?.height || 100;
        
        // Fill if fillColor is not transparent
        if (element.fillColor && element.fillColor !== 'transparent') {
          ctx.fillRect(element.position.x, element.position.y, rectWidth, rectHeight);
        }
        
        // Stroke
        ctx.strokeRect(element.position.x, element.position.y, rectWidth, rectHeight);
        break;
      }
      case 'circle': {
        const radius = element.dimensions?.width || 50;
        ctx.beginPath();
        ctx.arc(element.position.x, element.position.y, radius, 0, 2 * Math.PI);
        
        // Fill if fillColor is not transparent
        if (element.fillColor && element.fillColor !== 'transparent') {
          ctx.fill();
        }
        
        // Stroke
        ctx.stroke();
        break;
      }
      case 'text':
        ctx.font = `${settings.fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = element.color || settings.strokeColor;
        ctx.fillText(element.data.text || 'Text', element.position.x, element.position.y);
        break;
    }
  }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing style based on settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = settings.strokeColor;
    ctx.lineWidth = settings.strokeWidth;

    // Draw grid
    drawGrid(ctx, rect.width, rect.height);
    
    // Redraw all elements
    elements.forEach(element => {
      drawElement(ctx, element);
    });

    // Draw current path
    if (currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  }, [elements, currentPath, settings, drawElement]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);

    if (selectedTool === 'eraser') {
      // Find and remove elements at this position
      const elementToRemove = elements.find(element => isPointInElement(pos, element));
      if (elementToRemove) {
        const newElements = elements.filter(el => el.id !== elementToRemove.id);
        setElements(newElements);
        onElementsChange(newElements);
      }
    } else if (selectedTool === 'pen') {
      setCurrentPath([pos]);
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: selectedTool,
        data: {},
        position: pos,
        dimensions: { width: 0, height: 0 },
        timestamp: Date.now(),
        color: settings.strokeColor,
        strokeWidth: settings.strokeWidth,
        fillColor: settings.fillColor,
      };
      setElements(prev => [...prev, newElement]);
    } else if (selectedTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newElement: CanvasElement = {
          id: Date.now().toString(),
          type: 'text',
          data: { text },
          position: pos,
          timestamp: Date.now(),
          color: settings.strokeColor,
        };
        setElements(prev => [...prev, newElement]);
        onElementsChange([...elements, newElement]);
      }
    }
  };

  // Helper function to check if a point is inside an element
  const isPointInElement = (point: { x: number; y: number }, element: CanvasElement): boolean => {
    switch (element.type) {
      case 'rectangle': {
        const width = element.dimensions?.width || 100;
        const height = element.dimensions?.height || 100;
        return point.x >= element.position.x && 
               point.x <= element.position.x + width &&
               point.y >= element.position.y && 
               point.y <= element.position.y + height;
      }
      case 'circle': {
        const radius = element.dimensions?.width || 50;
        const dx = point.x - element.position.x;
        const dy = point.y - element.position.y;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
      }
      case 'path': {
        if (!element.data.points) return false;
        // Check if point is near any point in the path
        return element.data.points.some((pathPoint: { x: number; y: number }) => {
          const dx = point.x - pathPoint.x;
          const dy = point.y - pathPoint.y;
          return Math.sqrt(dx * dx + dy * dy) <= 10; // 10px tolerance
        });
      }
      case 'text': {
        // Simple bounding box check for text
        const textWidth = (element.data.text?.length || 0) * 10; // Rough estimate
        const textHeight = 20;
        return point.x >= element.position.x && 
               point.x <= element.position.x + textWidth &&
               point.y >= element.position.y - textHeight && 
               point.y <= element.position.y;
      }
      default:
        return false;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (selectedTool === 'pen') {
      setCurrentPath(prev => [...prev, pos]);
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      setElements(prev => {
        const newElements = [...prev];
        const lastElement = newElements[newElements.length - 1];
        if (lastElement) {
          lastElement.dimensions = {
            width: Math.abs(pos.x - lastElement.position.x),
            height: Math.abs(pos.y - lastElement.position.y),
          };
        }
        return newElements;
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (selectedTool === 'pen' && currentPath.length > 1) {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: 'path',
        data: { points: currentPath },
        position: currentPath[0],
        timestamp: Date.now(),
        color: settings.strokeColor,
        strokeWidth: settings.strokeWidth,
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      onElementsChange(newElements);
      setCurrentPath([]);
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      onElementsChange(elements);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full relative overflow-hidden">
      <div className="absolute top-4 left-4 text-sm text-gray-500 z-10">
        {selectedTool === 'pen' && 'Draw freely'}
        {selectedTool === 'rectangle' && 'Click and drag to create rectangle'}
        {selectedTool === 'circle' && 'Click and drag to create circle'}
        {selectedTool === 'text' && 'Click to add text'}
        {selectedTool === 'select' && 'Click to select elements'}
      </div>
      
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
});

Whiteboard.displayName = 'Whiteboard';

export default Whiteboard;