import { useCallback, useRef, useState, ReactNode } from 'react';
import { useFiles } from '../hooks/useFiles';
import { useApp } from '../context/AppContext';

interface FileUploadProps {
  children: ReactNode;
  className?: string;
}

export function FileUpload({ children, className = '' }: FileUploadProps) {
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
    <div className={`relative ${className}`} onDragEnter={handleDragIn}>
      {/* Overlay для drag'n'drop */}
      {dragActive && (
        <div
          className="absolute inset-0 z-50 bg-white bg-opacity-10 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center"
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center text-blue-600 px-6 py-4 pointer-events-none">
            <svg
              className="mx-auto h-16 w-16 mb-4"
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
            <div className="text-lg font-semibold">Отпустите файлы здесь</div>
            <div className="text-sm">Поддерживаются файлы .map</div>
          </div>
        </div>
      )}

      {/* Заголовок */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Карты</h2>

      <div className="pb-3">
        <button
          onClick={handleFileSelect}
          disabled={state.isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state.isLoading ? 'Загрузка...' : 'Выбрать файлы'}
        </button>
      </div>

      {/* Скрытый input для выбора файлов */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".map"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Дочерние компоненты */}
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}
