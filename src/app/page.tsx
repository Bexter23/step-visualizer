'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ModelViewer from '@/components/ModelViewer';
import ModelLibrary from '@/components/ModelLibrary';

interface Model {
  id: string;
  name: string;
  data: ArrayBuffer;
  timestamp: number;
}

export default function Home() {
  const [models, setModels] = useState<Model[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileLoaded = async (name: string, data: ArrayBuffer) => {
    setIsProcessing(true);
    try {
      const newModel: Model = {
        id: crypto.randomUUID(),
        name,
        data,
        timestamp: Date.now(),
      };

      setModels(prev => [newModel, ...prev]);
      setActiveModelId(newModel.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteModel = (modelId: string) => {
    setModels(prev => prev.filter(model => model.id !== modelId));
    if (activeModelId === modelId) {
      const remainingModels = models.filter(model => model.id !== modelId);
      setActiveModelId(remainingModels.length > 0 ? remainingModels[0].id : null);
    }
  };

  const activeModel = models.find(model => model.id === activeModelId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">STEP File Viewer</h1>
            <p className="mt-2 text-sm text-gray-600">Upload your STEP files and view them in 3D</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-6">
                <ModelLibrary
                  models={models}
                  activeModelId={activeModelId}
                  onSelectModel={setActiveModelId}
                  onDeleteModel={handleDeleteModel}
                />
              </div>
            </div>

            {/* Main Area */}
            <div className="lg:col-span-3 space-y-6">
              <div className="transition-all duration-200 ease-in-out">
                <FileUpload onFileLoaded={handleFileLoaded} isProcessing={isProcessing} />
              </div>

              <div className="transition-all duration-300 ease-in-out">
                {activeModel && (
                  <ModelViewer fileData={activeModel.data} />
                )}

                {!activeModel && models.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-gray-500 space-y-2">
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <p>Select a model from the library to view</p>
                    </div>
                  </div>
                )}

                {models.length === 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-gray-500 space-y-2">
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p>Upload a STEP file to get started</p>
                      <p className="text-sm text-gray-400">Drag and drop or click the upload area above</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
