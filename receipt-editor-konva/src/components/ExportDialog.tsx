'use client';

import React, { useState } from 'react';
import { FiX, FiDownload, FiImage } from 'react-icons/fi';
import { KonvaStage } from '@/lib/types/konva';
import { useCanvasStore } from '@/lib/stores/canvasStore';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stageRef: React.RefObject<KonvaStage | null>;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, stageRef }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { config } = useCanvasStore();

  const [exportSettings, setExportSettings] = useState({
    filename: 'receipt',
    format: 'png',
  });

  const FIXED_WIDTH = 1160;
  const FIXED_HEIGHT = 406;

  // キャンバスの設定から向きを自動判定
  const orientation = config.orientation;

  if (!isOpen) return null;

  console.log('ExportDialog opened with settings:', exportSettings);

  const handleExport = async () => {
    console.log('Export button clicked');
    console.log('Current orientation:', orientation);
    
    if (!stageRef.current) {
      console.log('Stage ref is null');
      setExportError('Canvas not found');
      return;
    }

    console.log('Stage ref found, starting export...');
    setIsExporting(true);
    setExportError(null);

    try {
      console.log('Generating image from stage...');
      // Konva Stageから画像データを取得
      // 縦向きの場合は幅と高さを入れ替えて取得
      const exportWidth = orientation === 'portrait' ? FIXED_HEIGHT : FIXED_WIDTH;
      const exportHeight = orientation === 'portrait' ? FIXED_WIDTH : FIXED_HEIGHT;
      
      let dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 1,
        width: exportWidth,
        height: exportHeight,
      });
      console.log('Image generated, dataURL length:', dataURL.length);

      // 縦向きの場合は画像を90度回転させて横向きにする
      if (orientation === 'portrait') {
        console.log('Export: Portrait mode detected, rotating image to landscape...');
        try {
          dataURL = await rotateImage(dataURL, -90);
          console.log('Export: Image rotation completed');
        } catch (error) {
          console.error('Export: Image rotation failed:', error);
          setExportError('Image rotation failed');
          return;
        }
      } else {
        console.log('Export: Landscape mode, no rotation needed');
      }

      console.log('Setting preview URL...');
      // プレビュー用のURLを設定
      setPreviewUrl(dataURL);

      console.log('Creating download link...');
      // ダウンロードリンクを作成
      const link = document.createElement('a');
      link.download = `${exportSettings.filename}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Download completed');

    } catch (error) {
      console.error('Export error:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = async () => {
    console.log('Preview button clicked');
    console.log('Current orientation:', orientation);
    
    if (!stageRef.current) {
      console.log('Stage ref is null');
      setExportError('Canvas not found');
      return;
    }

    console.log('Stage ref found, starting preview...');
    setIsExporting(true);
    setExportError(null);

    try {
      console.log('Generating image from stage...');
      // 縦向きの場合は幅と高さを入れ替えて取得
      const exportWidth = orientation === 'portrait' ? FIXED_HEIGHT : FIXED_WIDTH;
      const exportHeight = orientation === 'portrait' ? FIXED_WIDTH : FIXED_HEIGHT;
      
      let dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 1,
        width: exportWidth,
        height: exportHeight,
      });
      console.log('Image generated, dataURL length:', dataURL.length);

      // 縦向きの場合は画像を90度回転させて横向きにする
      if (orientation === 'portrait') {
        console.log('Preview: Portrait mode detected, rotating image to landscape...');
        try {
          dataURL = await rotateImage(dataURL, -90);
          console.log('Preview: Image rotation completed');
        } catch (error) {
          console.error('Preview: Image rotation failed:', error);
          setExportError('Image rotation failed');
          return;
        }
      } else {
        console.log('Preview: Landscape mode, no rotation needed');
      }

      console.log('Setting preview URL...');
      setPreviewUrl(dataURL);
      console.log('Preview completed successfully');
    } catch (error) {
      console.error('Preview error:', error);
      setExportError(error instanceof Error ? error.message : 'Preview failed');
    } finally {
      setIsExporting(false);
    }
  };

  // 画像を回転させる関数
  const rotateImage = (dataURL: string, degrees: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        console.log(`Original image size: ${img.width} × ${img.height}`);
        
        // 90度回転の場合、幅と高さを入れ替え
        canvas.width = img.height;
        canvas.height = img.width;
        
        console.log(`Rotated canvas size: ${canvas.width} × ${canvas.height}`);

        // 背景を白で塗りつぶし
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // キャンバスの中心に移動
        ctx.translate(canvas.width / 2, canvas.height / 2);
        // 90度回転
        ctx.rotate((degrees * Math.PI) / 180);
        // 画像を描画（中心を原点として）
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        console.log('Image rotation transformation applied');

        const rotatedDataURL = canvas.toDataURL('image/png');
        console.log('Rotated image data URL generated');
        resolve(rotatedDataURL);
      };

      img.onerror = (error) => {
        console.error('Image loading error:', error);
        reject(error);
      };

      // CORS対応のため、crossOriginを設定
      img.crossOrigin = 'anonymous';
      img.src = dataURL;
    });
  };

  const handleSettingChange = (key: string, value: string | number) => {
    console.log(`Setting change: ${key} = ${value}`);
    setExportSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: value,
      };
      console.log('New export settings:', newSettings);
      return newSettings;
    });
    // Clear preview when settings change
    setPreviewUrl(null);
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
                <h3 className="text-sm font-medium text-gray-900 mb-4">Export Settings</h3>
                
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
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Export Size</h4>
                    <p className="text-sm text-gray-600">
                      横向き: {FIXED_WIDTH} × {FIXED_HEIGHT} px (Receipt format)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {orientation === 'portrait' 
                        ? '※ 縦向きキャンバスを90度回転して横向きでエクスポートします'
                        : '※ キャンバスの設定に基づいて自動判定されます'
                      }
                    </p>
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
