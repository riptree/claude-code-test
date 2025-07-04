'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { KonvaStage } from '@/lib/types/konva';

interface ReceiptCanvasProps {
  className?: string;
  stageRef?: React.RefObject<KonvaStage | null>;
}

// React-Konvaを動的インポート
const DynamicKonvaCanvas = dynamic(() => import('./KonvaCanvas'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg w-full h-96 max-w-4xl">
      <div className="text-gray-500">Loading canvas...</div>
    </div>
  )
});

const ReceiptCanvas: React.FC<ReceiptCanvasProps> = ({ className, stageRef }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`${className || ''} flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg w-full h-96 max-w-4xl`}>
        <div className="text-gray-500">Loading canvas...</div>
      </div>
    );
  }

  return <DynamicKonvaCanvas className={className} stageRef={stageRef} />;
};

export default ReceiptCanvas;
