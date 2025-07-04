'use client';

import React from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stageRef?: React.RefObject<any>;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Export Receipt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="text-center py-8">
          <FiDownload size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Export functionality will be implemented here</p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
