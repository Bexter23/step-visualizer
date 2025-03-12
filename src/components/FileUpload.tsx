'use client';

import { useState } from 'react';

interface FileUploadProps {
  onFileLoaded: (name: string, data: ArrayBuffer) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileLoaded, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.stp') && !file.name.toLowerCase().endsWith('.step')) {
      alert('Please upload a STEP file (.stp or .step)');
      return;
    }

    const buffer = await file.arrayBuffer();
    onFileLoaded(file.name, buffer);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all relative
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${isProcessing ? 'pointer-events-none' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => {
        if (!isProcessing) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.stp,.step';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }
      }}
    >
      {isProcessing ? (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-gray-600">Processing model...</span>
          </div>
        </div>
      ) : (
        <div className="text-gray-600">
          <p className="mb-2">Drag and drop your STEP file here</p>
          <p className="text-sm">or click to browse</p>
        </div>
      )}
    </div>
  );
} 