'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ReceiptCanvas } from '@/components/ReceiptCanvas';
import { Toolbar } from '@/components/Toolbar';
import { PropertyPanel } from '@/components/PropertyPanel';
import { ExportDialog } from '@/components/ExportDialog';
import { FiDownload } from 'react-icons/fi';
import { Stage as KonvaStage } from 'konva/lib/Stage';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const stageRef = useRef<KonvaStage | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Toolbar */}
      <Toolbar className="w-64 flex-shrink-0" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Receipt Editor</h1>
            <p className="text-sm text-gray-600">Create custom receipt images for printing</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExportDialogOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiDownload className="mr-2" />
              Export BMP
            </button>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <ReceiptCanvas stageRef={stageRef} className="max-w-full max-h-full" />
          </div>
          
          {/* Properties Panel */}
          <PropertyPanel className="w-80 flex-shrink-0" />
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        stageRef={stageRef}
      />
    </div>
  );
}
