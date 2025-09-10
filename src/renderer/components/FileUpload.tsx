import { useCallback, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useFiles } from '../hooks/useFiles';

export function FileUpload() {
  const { state } = useApp();
  const { loadFilesFromFileList } = useFiles();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        try {
          await loadFilesFromFileList(files);
        } catch (error) {
          console.error('Ошибка загрузки файлов:', error);
        }
      }
      // Очищаем input для возможности повторного выбора тех же файлов
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [loadFilesFromFileList]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      const mapFiles = files.filter(file =>
        file.name.toLowerCase().endsWith('.map')
      );

      if (mapFiles.length === 0) {
        alert('Пожалуйста, выберите файлы с расширением .map');
        return;
      }

      try {
        const fileList = new DataTransfer();
        mapFiles.forEach(file => fileList.items.add(file));
        await loadFilesFromFileList(fileList.files);
      } catch (error) {
        console.error('Ошибка загрузки файлов:', error);
      }
    },
    [loadFilesFromFileList]
  );

  return (
    <div
      className={`mb-4 p-6 border-2 border-dashed rounded-lg transition-colors ${
        dragActive
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${state.isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Нажмите для выбора файлов</span> или
          перетащите сюда
        </div>
        <p className="text-xs text-gray-500 mb-4">Поддерживаются файлы .map</p>
        <button
          onClick={handleFileSelect}
          disabled={state.isLoading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state.isLoading ? 'Загрузка...' : 'Выбрать файлы'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".map"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
