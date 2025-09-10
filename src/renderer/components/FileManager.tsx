import React from 'react';
import { useAppStore } from '../store/useAppStore';

const FileManager: React.FC = () => {
  const {
    files,
    addFiles,
    removeFile,
    toggleFileVisibility,
    toggleMapVisibility,
  } = useAppStore();

  const handleSelectFiles = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.selectFiles();
        if (!result.canceled && result.filePaths.length > 0) {
          // TODO: Парсинг файлов и создание MapFile объектов
          console.log('Selected files:', result.filePaths);
        }
      }
    } catch (error) {
      console.error('Error selecting files:', error);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Управление файлами
      </h2>

      <button onClick={handleSelectFiles} className="btn-primary w-full mb-4">
        Выбрать файлы
      </button>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button className="btn-secondary flex-1 text-sm">
              Включить все
            </button>
            <button className="btn-secondary flex-1 text-sm">
              Отключить все
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map(file => (
              <div key={file.id} className="card p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={file.isVisible}
                      onChange={() => toggleFileVisibility(file.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {file.name}
                    </span>
                  </label>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-1 ml-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={file.gasolineVisible}
                      onChange={() => toggleMapVisibility(file.id, 'gasoline')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs text-gray-600">Бензин</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={file.gasVisible}
                      onChange={() => toggleMapVisibility(file.id, 'gas')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs text-gray-600">Газ</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
