import React, { useState, useRef } from 'react';
import Whiteboard, { WhiteboardRef } from './components/Whiteboard';
import CodePreview from './components/CodePreview';
import ToolPalette from './components/ToolPalette';
import Header from './components/Header';
import { CanvasElement, Tool } from './types';
import { AICodeGenerator, DrawingData } from './utils/aiIntegration';

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool>('pen');
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const whiteboardRef = useRef<WhiteboardRef>(null);

  const handleElementsChange = (elements: CanvasElement[]) => {
    setCanvasElements(elements);
  };

  const handleGenerateCode = async () => {
    if (!apiKey) {
      alert('Gemini API key not found. Please check your .env file.');
      return;
    }

    if (canvasElements.length === 0) {
      alert('Please draw something on the whiteboard first!');
      return;
    }

    setIsGenerating(true);
    try {
      const aiGenerator = new AICodeGenerator(apiKey);
      
      // Get canvas dimensions from the whiteboard component
      const canvas = document.querySelector('canvas');
      const canvasData: DrawingData = {
        elements: canvasElements,
        canvas: {
          width: canvas?.width || 800,
          height: canvas?.height || 600
        }
      };

      const result = await aiGenerator.generateComponent(canvasData);
      setGeneratedCode(result.code);
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate code. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    whiteboardRef.current?.clearCanvas();
    setGeneratedCode('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        hasApiKey={!!apiKey}
      />
      
      <div className="flex-1 flex">
        {/* Tool Palette */}
        <ToolPalette 
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onGenerateCode={handleGenerateCode}
          onClear={handleClear}
          isGenerating={isGenerating}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Whiteboard */}
          <div className="flex-1 p-4">
            <Whiteboard 
              ref={whiteboardRef}
              selectedTool={selectedTool}
              onElementsChange={handleElementsChange}
            />
          </div>
          
          {/* Code Preview */}
          <div className="w-1/3 border-l border-gray-200">
            <CodePreview 
              code={generatedCode}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;