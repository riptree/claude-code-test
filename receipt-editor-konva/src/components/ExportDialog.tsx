'use client';

import React, { useState } from 'react';
import { FiX, FiDownload, FiImage } from 'react-icons/fi';
import { KonvaStage } from '@/lib/types/konva';
import { useCanvasStore } from '@/lib/stores/canvasStore';
import { dataURLToBMP, MonochromeOptions } from '@/lib/canvas/bmpExporter';
import { CanvasConfig } from '@/lib/types';

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

  // エクスポート用の固定サイズ
  const EXPORT_WIDTH = 1160;
  const EXPORT_HEIGHT = 406;

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
      
      // キャンバスの実際のサイズを取得
      const canvasWidth = config.width;
      const canvasHeight = config.height;
      
      // スケーリング比率を計算（縦横比を保持）
      const scaleX = EXPORT_WIDTH / canvasWidth;
      const scaleY = EXPORT_HEIGHT / canvasHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // スケーリングされたサイズ
      const scaledWidth = canvasWidth * scale;
      const scaledHeight = canvasHeight * scale;
      
      console.log(`Canvas size: ${canvasWidth} × ${canvasHeight}`);
      console.log(`Export size: ${EXPORT_WIDTH} × ${EXPORT_HEIGHT}`);
      console.log(`Scale: ${scale}, Scaled size: ${scaledWidth} × ${scaledHeight}`);
      
      // Konva Stageから画像データを取得（スケーリング適用）
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: scale,
        width: canvasWidth,
        height: canvasHeight,
      });
      console.log('Image generated, dataURL length:', dataURL.length);

      console.log('Creating download link...');
      
      // キャンバスと同じフィルター効果を適用してからBMP変換
      let processedDataURL = dataURL;
      if (config.monochromePreview) {
        processedDataURL = await applyCanvasFilter(dataURL, config);
      }
      
      // PNG→BMP変換を行う（フィルター適用済みの場合は白黒変換を無効化）
      console.log('Converting PNG to BMP...');
      const shouldApplyMonochrome = !config.monochromePreview; // フィルター適用済みの場合は無効化
      const monochromeOptions: MonochromeOptions = {
        threshold: config.monochromeThreshold,
      };
      console.log('Monochrome options being passed:', monochromeOptions);
      const bmpBlob = await dataURLToBMP(processedDataURL, shouldApplyMonochrome, monochromeOptions);
      console.log('BMP conversion completed');

      // ダウンロードリンクを作成
      const link = document.createElement('a');
      link.download = `${exportSettings.filename}.bmp`;
      link.href = URL.createObjectURL(bmpBlob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URLオブジェクトを解放
      URL.revokeObjectURL(link.href);
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
      
      // キャンバスの実際のサイズを取得
      const canvasWidth = config.width;
      const canvasHeight = config.height;
      
      // スケーリング比率を計算（縦横比を保持）
      const scaleX = EXPORT_WIDTH / canvasWidth;
      const scaleY = EXPORT_HEIGHT / canvasHeight;
      const scale = Math.min(scaleX, scaleY);
      
      console.log(`Canvas size: ${canvasWidth} × ${canvasHeight}`);
      console.log(`Export size: ${EXPORT_WIDTH} × ${EXPORT_HEIGHT}`);
      console.log(`Scale: ${scale}`);
      
      // Konva Stageから画像データを取得（スケーリング適用）
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: scale,
        width: canvasWidth,
        height: canvasHeight,
      });
      console.log('Image generated, dataURL length:', dataURL.length);

      console.log('Setting preview URL...');
      
      // キャンバスと同じCSSフィルター効果を適用
      if (config.monochromePreview) {
        // キャンバスと同じフィルター効果を適用したプレビュー
        const filteredDataURL = await applyCanvasFilter(dataURL, config);
        setPreviewUrl(filteredDataURL);
      } else {
        // フィルターなしのプレビュー
        setPreviewUrl(dataURL);
      }
      
      console.log('Preview completed successfully');
    } catch (error) {
      console.error('Preview error:', error);
      setExportError(error instanceof Error ? error.message : 'Preview failed');
    } finally {
      setIsExporting(false);
    }
  };

  // キャンバスと同じCSSフィルター効果を適用する関数
  const applyCanvasFilter = async (dataURL: string, config: CanvasConfig): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(dataURL);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 白背景で塗りつぶし
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 画像を描画
        ctx.drawImage(img, 0, 0);
        
        // キャンバスと同じフィルター効果を適用
        const filterCanvas = document.createElement('canvas');
        const filterCtx = filterCanvas.getContext('2d');
        
        if (!filterCtx) {
          resolve(dataURL);
          return;
        }
        
        filterCanvas.width = canvas.width;
        filterCanvas.height = canvas.height;
        
        // フィルター効果を適用
        filterCtx.filter = `grayscale(1) contrast(${Math.min(config.monochromeContrast * 1.2, 2.5)})`;
        filterCtx.drawImage(canvas, 0, 0);
        
        resolve(filterCanvas.toDataURL('image/png'));
      };
      
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
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Export Settings</h4>
                    <p className="text-sm text-gray-600">
                      フォーマット: BMP (白黒2階調)
                    </p>
                    <p className="text-sm text-gray-600">
                      サイズ: {EXPORT_WIDTH} × {EXPORT_HEIGHT} px
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
                    Click &quot;Preview&quot; to see how your receipt will look
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
