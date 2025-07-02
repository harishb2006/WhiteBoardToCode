import React from 'react';
import { 
  Pen, 
  Square, 
  Circle, 
  Type, 
  MousePointer,
  Sparkles,
  Download,
  Trash2,
  Undo,
  Redo
} from 'lucide-react';
import { Tool } from '../types';

interface ToolPaletteProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
  onGenerateCode: () => void;
  onClear?: () => void;
  isGenerating: boolean;
}

const ToolPalette: React.FC<ToolPaletteProps> = ({
  selectedTool,
  onToolSelect,
  onGenerateCode,
  onClear,
  isGenerating
}) => {
  const tools = [
    { id: 'select' as Tool, icon: MousePointer, label: 'Select' },
    { id: 'pen' as Tool, icon: Pen, label: 'Pen' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
    { id: 'text' as Tool, icon: Type, label: 'Text' },
  ];

  const handleDownload = () => {
    // Create and download the generated component
    const blob = new Blob(['// Generated component code would be here'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GeneratedComponent.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
      {/* Drawing Tools */}
      <div className="space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;
          
          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
                ${isSelected 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              title={tool.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-200 my-4" />

      {/* Action Tools */}
      <div className="space-y-2">
        <button
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title="Undo"
        >
          <Undo className="w-5 h-5" />
        </button>
        
        <button
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title="Redo"
        >
          <Redo className="w-5 h-5" />
        </button>
        
        <button
          onClick={onClear}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title="Clear"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-gray-200 my-4" />

      {/* AI Actions */}
      <div className="space-y-2">
        <button
          onClick={onGenerateCode}
          disabled={isGenerating}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
            ${isGenerating
              ? 'bg-purple-100 text-purple-600 animate-pulse'
              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
            }
          `}
          title="Generate Code"
        >
          <Sparkles className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleDownload}
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg"
          title="Download Code"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ToolPalette;