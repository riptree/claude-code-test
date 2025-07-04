'use client';

import { useCanvasStore } from '@/lib/stores/canvasStore';
import ReceiptCanvas from '@/components/ReceiptCanvas';
import Toolbar from '@/components/Toolbar';
import PropertyPanel from '@/components/PropertyPanel';

export default function Home() {
  const { config } = useCanvasStore();

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Receipt Editor</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {config.width} × {config.height}px ({config.orientation})
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <div className="w-16 bg-white border-r border-gray-200 shadow-sm">
          <Toolbar />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
          <ReceiptCanvas />
        </div>

        {/* Property Panel */}
        <div className="w-80 bg-white border-l border-gray-200 shadow-sm">
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
}
