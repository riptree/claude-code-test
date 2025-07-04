'use client';

import React, { useEffect, useState } from 'react';

interface ReceiptCanvasProps {
  className?: string;
  stageRef?: React.RefObject<unknown>;
}

const ReceiptCanvas: React.FC<ReceiptCanvasProps> = ({ className }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`${className || ''} flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg`}>
        <div className="text-gray-500">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div className={`${className || ''} flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg`}>
      <div className="text-gray-500">Canvas will be loaded here</div>
    </div>
  );
};

export default ReceiptCanvas;
