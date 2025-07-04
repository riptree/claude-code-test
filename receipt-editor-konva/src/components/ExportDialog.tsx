'use client';

import React, { useState, useRef } from 'react';
import { useCanvasStore } from '@/lib/stores/canvasStore';
import { exportToBMP, downloadBMP, previewBMP } from '@/lib/canvas/bmpExporter';
import { FiDownload, FiImage, FiX, FiSettings } from 'react-icons/fi';
import Konva from 'konva';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stageRef: React.RefObject<Konva.Stage>;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, stageRef }) => {
  const { config } = useCanvasStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    width: config.width,
    height: config.height,
    quality: 1,
    monochrome: true,
    filename: 'receipt',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!stageRef.current) {
      setExportError('Canvas not found');
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const blob = await exportToBMP(stageRef.current, {
        width: exportSettings.width,
        height: exportSettings.height,
        quality: exportSettings.quality,
        monochrome: exportSettings.monochrome,
        maxFileSize: config.maxFileSize,
      });

      setFileSize(blob.size);
      
      // Generate preview
      const preview = await previewBMP(blob);
      setPreviewUrl(preview);

      // Download the file
      downloadBMP(blob, `${exportSettings.filename}.bmp`);

    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = async () => {
    if (!stageRef.current) {
      setExportError('Canvas not found');
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const blob = await exportToBMP(stageRef.current, {
        width: exportSettings.width,
        height: exportSettings.height,
        quality: exportSettings.quality,
        monochrome: exportSettings.monochrome,
        maxFileSize: config.maxFileSize,
      });

      setFileSize(blob.size);
      
      // Generate preview
      const preview = await previewBMP(blob);
      setPreviewUrl(preview);

    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Preview failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    // Clear preview when settings change
    setPreviewUrl(null);
    setFileSize(null);
  };

  const resetSettings = () => {
    setExportSettings({
      width: config.width,
      height: config.height,
      quality: 1,
      monochrome: true,
      filename: 'receipt',
    });
    setPreviewUrl(null);
    setFileSize(null);
    setExportError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Export Receipt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Settings Panel */}
          <div className="w-1/2 p-4 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <FiSettings className="mr-2" />
                  Export Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filename
                    </label>
                    <input
                      type="text"
                      value={exportSettings.filename}
                      onChange={(e) => handleSettingChange('filename', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="receipt"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      File will be saved as {exportSettings.filename}.bmp
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        value={exportSettings.width}
                        onChange={(e) => handleSettingChange('width', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        min="1"
                        max="5000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        value={exportSettings.height}
                        onChange={(e) => handleSettingChange('height', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        min="1"
                        max="5000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportSettings.monochrome}
                        onChange={(e) => handleSettingChange('monochrome', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Monochrome (Black & White only)
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Converts image to pure black and white for receipt printing
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Format: BMP</li>
                      <li>• Max file size: {(config.maxFileSize / 1024).toFixed(0)}KB</li>
                      <li>• Recommended: 1160×406px (landscape) or 406×1160px (portrait)</li>
                      <li>• Color: Monochrome for receipt printers</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handlePreview}
                  disabled={isExporting}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiImage className="mr-2" />
                  {isExporting ? 'Generating...' : 'Preview'}
                </button>
                <button
                  onClick={resetSettings}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 p-4 overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Preview</h3>
              
              {exportError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{exportError}</p>
                </div>
              )}

              {fileSize && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    File size: {(fileSize / 1024).toFixed(1)}KB
                    {fileSize > config.maxFileSize && (
                      <span className="text-red-600 ml-2">
                        (Exceeds {(config.maxFileSize / 1024).toFixed(0)}KB limit)
                      </span>
                    )}
                  </p>
                </div>
              )}

              {previewUrl ? (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <img
                    src={previewUrl}
                    alt="Export preview"
                    className="max-w-full h-auto mx-auto border border-gray-300 rounded"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 text-center">
                  <FiImage size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">
                    Click "Preview" to see how your receipt will look
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiDownload className="mr-2" />
                  {isExporting ? 'Exporting...' : 'Export & Download'}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;