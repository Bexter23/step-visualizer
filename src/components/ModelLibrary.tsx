'use client';

interface Model {
  id: string;
  name: string;
  data: ArrayBuffer;
  timestamp: number;
}

interface ModelLibraryProps {
  models: Model[];
  activeModelId: string | null;
  onSelectModel: (modelId: string) => void;
  onDeleteModel: (modelId: string) => void;
}

export default function ModelLibrary({ models, activeModelId, onSelectModel, onDeleteModel }: ModelLibraryProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-[600px] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Model Library</h2>
      {models.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No models uploaded yet
        </div>
      ) : (
        <div className="space-y-2">
          {models.map((model) => (
            <div
              key={model.id}
              className={`p-3 rounded-lg cursor-pointer transition-all group relative
                ${activeModelId === model.id 
                  ? 'bg-blue-100 border-blue-300' 
                  : 'hover:bg-gray-50 border-transparent'
                } border`}
              onClick={() => onSelectModel(model.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800 truncate">
                    {model.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(model.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteModel(model.id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 