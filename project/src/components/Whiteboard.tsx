import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { CanvasElement, Tool } from '../types';

interface WhiteboardProps {
  selectedTool: Tool;
  onElementsChange: (elements: CanvasElement[]) => void;
}

export interface WhiteboardRef {
  clearCanvas: () => void;
}

const Whiteboard = forwardRef<WhiteboardRef, WhiteboardProps>(({ selectedTool, onElementsChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  const clearCanvas = () => {
    setElements([]);
    setCurrentPath([]);
    onElementsChange([]);
  };

  useImperativeHandle(ref, () => ({
    clearCanvas
  }));

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
    
    // Set drawing style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

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
  }, [elements, currentPath]);

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

  const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;

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
      case 'rectangle':
        ctx.strokeRect(
          element.position.x,
          element.position.y,
          element.dimensions?.width || 100,
          element.dimensions?.height || 100
        );
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(
          element.position.x,
          element.position.y,
          element.dimensions?.width || 50,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        break;
      case 'text':
        ctx.font = '16px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#374151';
        ctx.fillText(element.data.text || 'Text', element.position.x, element.position.y);
        break;
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

    if (selectedTool === 'pen') {
      setCurrentPath([pos]);
    } else if (selectedTool === 'rectangle' || selectedTool === 'circle') {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: selectedTool,
        data: {},
        position: pos,
        dimensions: { width: 0, height: 0 },
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
        };
        setElements(prev => [...prev, newElement]);
        onElementsChange([...elements, newElement]);
      }
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