import React, { useState, useRef, useEffect } from 'react';
import { Code, Palette, Settings, Download, ChevronDown, BookOpen } from 'lucide-react';
import { Mode } from '../types';
import { downloadSVG, downloadImage, downloadPDF } from '../utils/downloadUtils';

interface HeaderProps {
  hasApiKey?: boolean;
  onDownload?: (format: 'svg' | 'png' | 'jpg' | 'pdf') => void;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const Header: React.FC<HeaderProps> = ({ hasApiKey, onDownload, mode, onModeChange }) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };

    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadMenu]);

  const handleDownload = (format: 'svg' | 'png' | 'jpg' | 'pdf') => {
    if (onDownload) {
      onDownload(format);
    }
    setShowDownloadMenu(false);
  };
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Whiteboard to Code</h1>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <Code className="w-4 h-4" />
            <span>AI-Powered Component Generator with Gemini</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onModeChange('code')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                mode === 'code'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="w-4 h-4 inline mr-1" />
              Code Mode
            </button>
            <button
              onClick={() => onModeChange('mentor')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                mode === 'mentor'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-1" />
              Mentor Mode
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {hasApiKey ? 'API Connected' : 'API Key Required'}
            </span>
          </div>
          
          {onDownload && (
            <div className="relative" ref={downloadMenuRef}>
              <button 
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                title="Download whiteboard"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showDownloadMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleDownload('svg')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Download as SVG
                    </button>
                    <button
                      onClick={() => handleDownload('png')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Download as PNG
                    </button>
                    <button
                      onClick={() => handleDownload('jpg')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Download as JPG
                    </button>
                    <button
                      onClick={() => handleDownload('pdf')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Download as PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button 
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Help
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;