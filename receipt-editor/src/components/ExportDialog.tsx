'use client';

import { useState } from 'react';
import { useCanvasStore } from '@/lib/stores/canvasStore';
import { exportCanvasAsBMP, validateBMPSize, estimateBMPFileSize } from '@/lib/canvas/bmpExporter';
import { saveAs } from 'file-saver';
import { FiDownload, FiX, FiSettings, FiInfo } from 'react-icons/fi';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export default function ExportDialog({ isOpen, onClose, canvasRef }: ExportDialogProps) {
  const { config } = useCanvasStore();
  const [exportSettings, setExportSettings] = useState({
    width: config.width,
    height: config.height,
    dithering: true,
    threshold: 128,
    filename: 'receipt',
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const estimatedSize = estimateBMPFileSize(exportSettings.width, exportSettings.height);
  const isValidSize = validateBMPSize(exportSettings.width, exportSettings.height, 1500);

  const handleExport = async () => {
    if (!canvasRef?.current) {
      alert('Canvas not found');
      return;
    }

    if (!isValidSize) {
      alert('File size would exceed 1500KB limit. Please reduce dimensions.');
      return;
    }

    setIsExporting(true);

    try {
      const blob = exportCanvasAsBMP(canvasRef.current, {
        width: exportSettings.width,
        height: exportSettings.height,
        dithering: exportSettings.dithering,
        threshold: exportSettings.threshold,
      });

      const filename = `${exportSettings.filename}.bmp`;
      saveAs(blob, filename);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setExportSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FiDownload size={20} />
            <h2 className="text-lg font-semibold">Export as BMP</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Filename */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filename
            </label>
            <input
              type="text"
              value={exportSettings.filename}
              onChange={(e) => handleSettingChange('filename', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="receipt"
            />
            <p className="text-xs text-gray-500 mt-1">Will be saved as {exportSettings.filename}.bmp</p>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensions
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Width (px)</label>
                <input
                  type="number"
                  value={exportSettings.width}
                  onChange={(e) => handleSettingChange('width', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="100"
                  max="2000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Height (px)</label>
                <input
                  type="number"
                  value={exportSettings.height}
                  onChange={(e) => handleSettingChange('height', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="100"
                  max="2000"
                />
              </div>
            </div>
          </div>

          {/* Color Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Settings
            </label>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Black/White Threshold (0-255)
                </label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={exportSettings.threshold}
                  onChange={(e) => handleSettingChange('threshold', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>More Black</span>
                  <span>{exportSettings.threshold}</span>
                  <span>More White</span>
                </div>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportSettings.dithering}
                  onChange={(e) => handleSettingChange('dithering', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Enable dithering (recommended)</span>
              </label>
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <FiInfo size={16} />
              <span className="text-sm font-medium">File Information</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Format:</span>
                <span>BMP (1-bit monochrome)</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated size:</span>
                <span className={`${isValidSize ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.round(estimatedSize / 1024)} KB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Size limit:</span>
                <span>1500 KB</span>
              </div>
            </div>
            
            {!isValidSize && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                File size exceeds 1500KB limit. Please reduce dimensions.
              </div>
            )}
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleSettingChange('width', 1160);
                  handleSettingChange('height', 406);
                }}
                className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Landscape<br />1160 × 406
              </button>
              <button
                onClick={() => {
                  handleSettingChange('width', 406);
                  handleSettingChange('height', 1160);
                }}
                className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Portrait<br />406 × 1160
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!isValidSize || isExporting}
            className={`
              px-6 py-2 rounded-md transition-colors flex items-center space-x-2
              ${isValidSize && !isExporting
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <FiDownload size={16} />
            <span>{isExporting ? 'Exporting...' : 'Export BMP'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}