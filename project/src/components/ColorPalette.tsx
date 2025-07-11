import React from 'react';
import { Palette, Circle, Square, Type, Minus } from 'lucide-react';
import { WhiteboardSettings } from '../types';

interface ColorPaletteProps {
  settings: WhiteboardSettings;
  onSettingsChange: (settings: Partial<WhiteboardSettings>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  settings,
  onSettingsChange,
  isOpen,
  onToggle
}) => {
  const colors = [
    '#000000', // Black
    '#374151', // Gray
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f59e0b'  // Amber
  ];

  const strokeWidths = [1, 2, 4, 6, 8, 12];
  const fontSizes = [12, 14, 16, 18, 24, 32];

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        title="Color & Style Options"
      >
        <Palette className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-80">
          <div className="space-y-4">
            {/* Stroke Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Circle className="w-4 h-4 inline mr-1" />
                Stroke Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onSettingsChange({ strokeColor: color })}
                    className={`w-8 h-8 rounded border-2 ${
                      settings.strokeColor === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    } transition-all`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Fill Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Square className="w-4 h-4 inline mr-1" />
                Fill Color
              </label>
              <div className="grid grid-cols-7 gap-2">
                <button
                  onClick={() => onSettingsChange({ fillColor: 'transparent' })}
                  className={`w-8 h-8 rounded border-2 ${
                    settings.fillColor === 'transparent'
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  } transition-all bg-white relative`}
                  title="No Fill"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                  </div>
                </button>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onSettingsChange({ fillColor: color })}
                    className={`w-8 h-8 rounded border-2 ${
                      settings.fillColor === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    } transition-all`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Minus className="w-4 h-4 inline mr-1" />
                Stroke Width: {settings.strokeWidth}px
              </label>
              <div className="flex gap-2">
                {strokeWidths.map((width) => (
                  <button
                    key={width}
                    onClick={() => onSettingsChange({ strokeWidth: width })}
                    className={`w-10 h-10 rounded border-2 ${
                      settings.strokeWidth === width
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    } transition-all flex items-center justify-center`}
                    title={`${width}px`}
                  >
                    <div
                      className="rounded-full bg-gray-800"
                      style={{
                        width: `${Math.max(width, 2)}px`,
                        height: `${Math.max(width, 2)}px`
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Type className="w-4 h-4 inline mr-1" />
                Font Size: {settings.fontSize}px
              </label>
              <div className="flex gap-2">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => onSettingsChange({ fontSize: size })}
                    className={`px-3 py-2 rounded border ${
                      settings.fontSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                    } transition-all text-sm font-medium`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Settings Preview */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Preview:</div>
              <div className="flex items-center gap-4">
                <div
                  className="w-6 h-6 rounded border-2"
                  style={{
                    borderColor: settings.strokeColor,
                    backgroundColor: settings.fillColor === 'transparent' ? 'transparent' : settings.fillColor,
                    borderWidth: `${settings.strokeWidth}px`
                  }}
                />
                <span
                  style={{
                    color: settings.strokeColor,
                    fontSize: `${settings.fontSize}px`
                  }}
                >
                  Sample Text
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPalette;
