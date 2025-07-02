import React from 'react';
import { Code, Palette, Settings } from 'lucide-react';

interface HeaderProps {
  hasApiKey?: boolean;
}

const Header: React.FC<HeaderProps> = ({ hasApiKey }) => {
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
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {hasApiKey ? 'API Connected' : 'API Key Required'}
            </span>
          </div>
          
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