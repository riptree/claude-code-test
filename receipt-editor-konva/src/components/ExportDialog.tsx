'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FiX, FiDownload, FiImage } from 'react-icons/fi';
import { Stage as KonvaStage } from 'konva/lib/Stage';
import { useCanvasStore } from '@/lib/stores/canvasStore';
import { dataURLToBMP } from '@/lib/canvas/bmpExporter';
import { CanvasConfig } from '@/lib/types';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stageRef: React.RefObject<KonvaStage | null>;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, stageRef }) => {
  const { config } = useCanvasStore();
  const [isExporting, setIsExporting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  
  // 閾値計算の共通ロジック
  const calculateThreshold = useCallback((config: CanvasConfig): number => {
    const baseThreshold = 128;
    const contrastFactor = config.monochromeContrast || 1;
    return Math.max(50, Math.min(205, baseThreshold / contrastFactor));
  }, []);
  
  const [exportSettings, setExportSettings] = useState({
    filename: 'receipt',
    threshold: calculateThreshold(config),
  });

  // エクスポートサイズの設定
  const EXPORT_WIDTH = 1160;
  const EXPORT_HEIGHT = 406;

  // キャンバスの設定から向きを自動判定
  const orientation = config.orientation;

  // キャンバスと同じCSSフィルター効果を適用し、2階調（白黒）に変換する関数
  const applyCanvasFilter = useCallback(async (dataURL: string, config: CanvasConfig, threshold?: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(dataURL);
        return;
      }
      
      const img = new window.Image();
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
        
        // フィルター効果を適用（グレースケール + コントラスト）
        filterCtx.filter = `grayscale(1) contrast(${Math.min(config.monochromeContrast * 1.2, 2.5)})`;
        filterCtx.drawImage(canvas, 0, 0);
        
        // ImageDataを取得して2階調（白黒）に変換
        const imageData = filterCtx.getImageData(0, 0, filterCanvas.width, filterCanvas.height);
        const data = imageData.data;
        
        // 閾値を使用（引数で指定されていない場合は計算）
        const thresholdValue = threshold !== undefined ? threshold : calculateThreshold(config);
        
        // ピクセルごとに2階調変換
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // グレースケール値を計算（既にグレースケールだが念のため）
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // 2階調変換：閾値より大きければ白(255)、小さければ黒(0)
          const binaryValue = gray > thresholdValue ? 255 : 0;
          
          data[i] = binaryValue;     // Red
          data[i + 1] = binaryValue; // Green
          data[i + 2] = binaryValue; // Blue
          // Alpha channel (data[i + 3]) はそのまま
        }
        
        // 変換されたImageDataをcanvasに戻す
        filterCtx.putImageData(imageData, 0, 0);
        
        resolve(filterCanvas.toDataURL('image/png'));
      };
      
      img.src = dataURL;
    });
  }, [calculateThreshold]);

  const handlePreview = useCallback(async () => {
    if (!stageRef.current) {
      setExportError('Canvas not found');
      return;
    }

    setExportError(null);

    try {
      // キャンバスの実際のサイズを取得
      const canvasWidth = config.width;
      const canvasHeight = config.height;
      
      // スケーリング比率を計算（縦横比を保持）
      const scaleX = EXPORT_WIDTH / canvasWidth;
      const scaleY = EXPORT_HEIGHT / canvasHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // Konva Stageから画像データを取得（スケーリング適用）
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: scale,
        width: canvasWidth,
        height: canvasHeight,
      });

      // キャンバスと同じCSSフィルター効果を適用（ユーザー指定の閾値を使用）
      const filteredDataURL = await applyCanvasFilter(dataURL, config, exportSettings.threshold);
      setPreviewUrl(filteredDataURL);

    } catch (error) {
      console.error('Preview error:', error);
      setExportError(error instanceof Error ? error.message : 'Preview failed');
    }
  }, [stageRef, config, EXPORT_WIDTH, EXPORT_HEIGHT, applyCanvasFilter, exportSettings.threshold]);

  // ダイアログが開かれたときにプレビューを生成
  useEffect(() => {
    if (isOpen && stageRef.current) {
      handlePreview();
    }
  }, [isOpen, handlePreview, stageRef]);

  // 閾値変更時のデバウンスプレビュー更新
  useEffect(() => {
    if (!isOpen || !stageRef.current) return;
    
    const debounceTimer = setTimeout(() => {
      handlePreview();
    }, 300); // 300msの遅延

    return () => clearTimeout(debounceTimer);
  }, [exportSettings.threshold, isOpen, stageRef, handlePreview]);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!stageRef.current) {
      setExportError('Canvas not found');
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      // キャンバスの実際のサイズを取得
      const canvasWidth = config.width;
      const canvasHeight = config.height;
      
      // スケーリング比率を計算（縦横比を保持）
      const scaleX = EXPORT_WIDTH / canvasWidth;
      const scaleY = EXPORT_HEIGHT / canvasHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // Konva Stageから画像データを取得（スケーリング適用）
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: scale,
        width: canvasWidth,
        height: canvasHeight,
      });

      // キャンバスと同じフィルター効果を適用してからBMP変換
      const processedDataURL = await applyCanvasFilter(dataURL, config, exportSettings.threshold);
      
      // PNG→BMP変換を行う（ユーザー指定の閾値を使用）
      const bmpBlob = await dataURLToBMP(processedDataURL, exportSettings.threshold);

      // ダウンロードリンクを作成
      const link = document.createElement('a');
      link.download = `${exportSettings.filename}.bmp`;
      link.href = URL.createObjectURL(bmpBlob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URLオブジェクトを解放
      URL.revokeObjectURL(link.href);

    } catch (error) {
      console.error('Export error:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };


  const handleSettingChange = (key: string, value: string | number) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    // Clear preview when filename changes, but not for threshold (threshold changes will auto-update preview)
    if (key !== 'threshold') {
      setPreviewUrl(null);
    }
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      白黒変換の閾値 ({exportSettings.threshold})
                    </label>
                    <p className="text-xs text-gray-600 mb-2">
                      スライダーを動かすとプレビューが更新されます
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={exportSettings.threshold}
                      onChange={(e) => handleSettingChange('threshold', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0 (黒が多い)</span>
                      <span>デフォルト: {Math.round(calculateThreshold(config))}</span>
                      <span>255 (白が多い)</span>
                    </div>
                    <button
                      onClick={() => handleSettingChange('threshold', calculateThreshold(config))}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      デフォルト値にリセット
                    </button>
                  </div>



                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Export Settings</h4>
                    <p className="text-sm text-gray-600">
                      フォーマット: BMP (白黒2階調)
                    </p>
                    <p className="text-sm text-gray-600">
                      サイズ: {EXPORT_WIDTH} × {EXPORT_HEIGHT} px
                    </p>
                    <p className="text-sm text-gray-600">
                      閾値: {exportSettings.threshold} 
                      {exportSettings.threshold === calculateThreshold(config) && ' (デフォルト)'}
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
                  <Image
                    src={previewUrl}
                    alt="Export preview"
                    width={400}
                    height={400}
                    className="max-w-full h-auto mx-auto border border-gray-300 rounded"
                    style={{ maxHeight: '400px' }}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 text-center">
                  <FiImage size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500">
                    ダイアログを開くとプレビューが表示されます
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ExportDialog };
