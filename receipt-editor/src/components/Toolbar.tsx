'use client';

import { useCanvasStore } from '@/lib/stores/canvasStore';
import { 
  FiMousePointer, 
  FiType, 
  FiSquare, 
  FiCircle, 
  FiMinus, 
  FiImage,
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
  FiCopy,
  FiRefreshCw,
  FiDownload
} from 'react-icons/fi';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ToolButton({ icon, label, isActive, onClick, disabled = false }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-12 h-12 flex items-center justify-center rounded-lg transition-colors
        ${isActive 
          ? 'bg-blue-500 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={label}
    >
      {icon}
    </button>
  );
}

export default function Toolbar() {
  const { 
    tool, 
    setTool, 
    config, 
    setOrientation, 
    selectedElementId, 
    deleteElement, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    clearCanvas
  } = useCanvasStore();

  const handleOrientationToggle = () => {
    const newOrientation = config.orientation === 'landscape' ? 'portrait' : 'landscape';
    setOrientation(newOrientation);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          // TODO: Add image to canvas
          console.log('Image uploaded:', imageUrl);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality will be implemented');
  };

  return (
    <div className="flex flex-col items-center p-2 space-y-2">
      {/* Selection Tools */}
      <div className="space-y-1">
        <ToolButton
          icon={<FiMousePointer size={18} />}
          label="Select"
          isActive={tool === 'select'}
          onClick={() => setTool('select')}
        />
      </div>

      {/* Drawing Tools */}
      <div className="space-y-1 border-t pt-2">
        <ToolButton
          icon={<FiType size={18} />}
          label="Text"
          isActive={tool === 'text'}
          onClick={() => setTool('text')}
        />
        <ToolButton
          icon={<FiSquare size={18} />}
          label="Rectangle"
          isActive={tool === 'rectangle'}
          onClick={() => setTool('rectangle')}
        />
        <ToolButton
          icon={<FiCircle size={18} />}
          label="Circle"
          isActive={tool === 'circle'}
          onClick={() => setTool('circle')}
        />
        <ToolButton
          icon={<FiMinus size={18} />}
          label="Line"
          isActive={tool === 'line'}
          onClick={() => setTool('line')}
        />
        <ToolButton
          icon={<FiImage size={18} />}
          label="Image"
          isActive={tool === 'image'}
          onClick={() => {
            setTool('image');
            handleImageUpload();
          }}
        />
      </div>

      {/* Edit Tools */}
      <div className="space-y-1 border-t pt-2">
        <ToolButton
          icon={<FiRotateCcw size={18} />}
          label="Undo"
          isActive={false}
          onClick={undo}
          disabled={!canUndo()}
        />
        <ToolButton
          icon={<FiRotateCw size={18} />}
          label="Redo"
          isActive={false}
          onClick={redo}
          disabled={!canRedo()}
        />
        <ToolButton
          icon={<FiCopy size={18} />}
          label="Duplicate"
          isActive={false}
          onClick={() => {
            // TODO: Implement duplicate functionality
            console.log('Duplicate functionality will be implemented');
          }}
          disabled={!selectedElementId}
        />
        <ToolButton
          icon={<FiTrash2 size={18} />}
          label="Delete"
          isActive={false}
          onClick={() => {
            if (selectedElementId) {
              deleteElement(selectedElementId);
            }
          }}
          disabled={!selectedElementId}
        />
      </div>

      {/* Layout Tools */}
      <div className="space-y-1 border-t pt-2">
        <ToolButton
          icon={<FiRefreshCw size={18} />}
          label={`Switch to ${config.orientation === 'landscape' ? 'Portrait' : 'Landscape'}`}
          isActive={false}
          onClick={handleOrientationToggle}
        />
      </div>

      {/* Export Tools */}
      <div className="space-y-1 border-t pt-2">
        <ToolButton
          icon={<FiDownload size={18} />}
          label="Export as BMP"
          isActive={false}
          onClick={handleExport}
        />
      </div>

      {/* Clear Canvas */}
      <div className="space-y-1 border-t pt-2">
        <ToolButton
          icon={<FiTrash2 size={18} />}
          label="Clear Canvas"
          isActive={false}
          onClick={() => {
            if (confirm('Are you sure you want to clear the canvas?')) {
              clearCanvas();
            }
          }}
        />
      </div>
    </div>
  );
}