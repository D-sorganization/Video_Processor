'use client';

import { DrawingTool } from '@/components/video/EditorCanvas';
import { MeasurementType } from '@/components/golf/MeasurementTools';

interface ProfessionalToolbarProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  gridEnabled: boolean;
  onGridToggle: () => void;
  measurementEnabled: boolean;
  onMeasurementToggle: () => void;
  disabled?: boolean;
}

export default function ProfessionalToolbar({
  currentTool,
  onToolChange,
  currentColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  gridEnabled,
  onGridToggle,
  measurementEnabled,
  onMeasurementToggle,
  disabled = false,
}: ProfessionalToolbarProps) {
  const tools = [
    { id: 'select', name: 'Select', icon: '↖', description: 'Select and move objects' },
    { id: 'line', name: 'Line', icon: '╱', description: 'Draw straight lines' },
    { id: 'arrow', name: 'Arrow', icon: '→', description: 'Draw arrows' },
    { id: 'freehand', name: 'Draw', icon: '✏', description: 'Freehand drawing' },
    { id: 'text', name: 'Text', icon: 'T', description: 'Add text annotations' },
    { id: 'angle', name: 'Angle', icon: '∠', description: 'Measure angles' },
    { id: 'distance', name: 'Distance', icon: '↔', description: 'Measure distances' },
  ];

  const colors = [
    { name: 'Green', value: '#00ff00' },
    { name: 'Red', value: '#ff0000' },
    { name: 'Blue', value: '#0066ff' },
    { name: 'Yellow', value: '#ffff00' },
    { name: 'White', value: '#ffffff' },
    { name: 'Orange', value: '#ff9900' },
    { name: 'Cyan', value: '#00ffff' },
    { name: 'Magenta', value: '#ff00ff' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 gradient-text">Drawing Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              disabled={disabled}
              className={`
                relative group p-3 rounded-lg font-medium text-sm
                transition-all duration-200
                ${
                  currentTool === tool.id
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                    : 'card-glass hover:scale-105'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={tool.description}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{tool.icon}</span>
                <span>{tool.name}</span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {tool.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Color Palette</h3>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => onColorChange(color.value)}
              disabled={disabled}
              className={`
                w-full aspect-square rounded-lg border-2 transition-all duration-200
                ${
                  currentColor === color.value
                    ? 'border-primary scale-110 shadow-lg'
                    : 'border-border hover:scale-105'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{ backgroundColor: color.value }}
              title={color.name}
              aria-label={color.name}
            />
          ))}
        </div>

        <div className="mt-3">
          <label className="text-xs text-muted-foreground mb-2 block">Custom Color</label>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            disabled={disabled}
            className="w-full h-10 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Stroke Width</h3>
        <div className="space-y-2">
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-primary
              [&::-webkit-slider-thumb]:cursor-pointer
              hover:[&::-webkit-slider-thumb]:scale-125
              transition-transform"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Width: {strokeWidth}px</span>
            <div
              className="rounded-full"
              style={{
                width: `${strokeWidth}px`,
                height: `${strokeWidth}px`,
                backgroundColor: currentColor
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-border">
        <h3 className="text-sm font-semibold">Overlays</h3>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm group-hover:text-primary transition-colors">Grid Overlay</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={gridEnabled}
              onChange={onGridToggle}
              disabled={disabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-disabled:opacity-50 transition-colors"></div>
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm group-hover:text-primary transition-colors">Measurements</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={measurementEnabled}
              onChange={onMeasurementToggle}
              disabled={disabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary peer-disabled:opacity-50 transition-colors"></div>
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      <div className="pt-3 border-t border-border">
        <button
          disabled={disabled}
          className="w-full btn-glass text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
