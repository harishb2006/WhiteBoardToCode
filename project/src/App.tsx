import React, { useState, useRef } from 'react';
import Whiteboard, { WhiteboardRef } from './components/Whiteboard';
import CodePreview from './components/CodePreview';
import ToolPalette from './components/ToolPalette';
import Header from './components/Header';
import MentorPanel from './components/MentorPanel';
import { CanvasElement, Tool, Mode, MentorSession, WhiteboardSettings } from './types';
import { AICodeGenerator, DrawingData } from './utils/aiIntegration';
import { downloadSVG, downloadImage, downloadPDF } from './utils/downloadUtils';
import { mentorService } from './utils/mentorService';
import HistoryManager from './utils/historyManager';

function App() {
  const [selectedTool, setSelectedTool] = useState<Tool>('pen');
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<Mode>('code');
  const [currentSession, setCurrentSession] = useState<MentorSession | null>(null);
  const [settings, setSettings] = useState<WhiteboardSettings>({
    strokeColor: '#374151',
    fillColor: 'transparent',
    strokeWidth: 2,
    fontSize: 16,
  });
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const whiteboardRef = useRef<WhiteboardRef>(null);
  const historyManager = useRef(new HistoryManager());

  const handleElementsChange = (elements: CanvasElement[]) => {
    setCanvasElements(elements);
    historyManager.current.addState(elements);
    
    // Update mentor session if active
    if (currentSession && mentorService.isSessionActive()) {
      mentorService.updateElements(elements);
    }
  };

  const handleSettingsChange = (newSettings: Partial<WhiteboardSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
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
    historyManager.current.clear();
  };

  const handleUndo = () => {
    const previousState = historyManager.current.undo();
    if (previousState) {
      setCanvasElements(previousState);
      handleElementsChange(previousState);
    }
  };

  const handleRedo = () => {
    const nextState = historyManager.current.redo();
    if (nextState) {
      setCanvasElements(nextState);
      handleElementsChange(nextState);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === 'code' && currentSession) {
      // End mentor session when switching to code mode
      handleSessionEnd();
    }
  };

  const handleSessionStart = (topic: string) => {
    const session = mentorService.startSession(topic);
    setCurrentSession(session);
    // Add initial interaction
    mentorService.addInteraction({
      type: 'note',
      content: `Started learning session: ${topic}`
    });
  };

  const handleSessionEnd = () => {
    const endedSession = mentorService.endSession();
    setCurrentSession(endedSession);
  };

  const handleAddInteraction = (type: 'question' | 'explanation' | 'note', content: string) => {
    mentorService.addInteraction({ type, content });
  };

  const handleAddElementFromAI = (instruction: string) => {
    // Add AI instruction as a text element to the whiteboard
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: 'text',
      data: { text: instruction },
      position: { x: 50, y: 50 + (canvasElements.length * 30) }, // Stack elements vertically
      timestamp: Date.now(),
    };
    
    const updatedElements = [...canvasElements, newElement];
    setCanvasElements(updatedElements);
    
    // Update mentor session
    if (currentSession && mentorService.isSessionActive()) {
      mentorService.updateElements(updatedElements);
    }
  };

  const handleDownload = (format: 'svg' | 'png' | 'jpg' | 'pdf') => {
    if (!whiteboardRef.current) {
      alert('Whiteboard not available for download');
      return;
    }

    const canvas = whiteboardRef.current.getCanvasRef();
    const elements = whiteboardRef.current.getElements();
    const dimensions = whiteboardRef.current.getCanvasDimensions();

    if (!canvas) {
      alert('Canvas not available for download');
      return;
    }

    switch (format) {
      case 'svg':
        downloadSVG(elements, dimensions.width, dimensions.height);
        break;
      case 'png':
        downloadImage(canvas, 'png');
        break;
      case 'jpg':
        downloadImage(canvas, 'jpg');
        break;
      case 'pdf':
        downloadPDF(canvas);
        break;
      default:
        alert('Unsupported format');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        hasApiKey={!!apiKey}
        onDownload={handleDownload}
        mode={mode}
        onModeChange={handleModeChange}
      />
      
      <div className="flex-1 flex">
        {/* Tool Palette */}
        <ToolPalette 
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onGenerateCode={handleGenerateCode}
          onClear={handleClear}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyManager.current.canUndo()}
          canRedo={historyManager.current.canRedo()}
          isGenerating={isGenerating}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Whiteboard */}
          <div className="flex-1 p-4">
            <Whiteboard 
              ref={whiteboardRef}
              selectedTool={selectedTool}
              onElementsChange={handleElementsChange}
              settings={settings}
            />
          </div>
          
          {/* Code Preview or Mentor Panel */}
          <div className="w-1/3 border-l border-gray-200">
            {mode === 'code' ? (
              <CodePreview 
                code={generatedCode}
                isGenerating={isGenerating}
              />
            ) : (
              <div className="h-full p-4">
                <MentorPanel
                  onSessionStart={handleSessionStart}
                  onSessionEnd={handleSessionEnd}
                  onAddInteraction={handleAddInteraction}
                  onAddElement={handleAddElementFromAI}
                  currentSession={currentSession}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;