import React, { useCallback, useState, useRef } from 'react';
import { useFiles } from '../hooks/useFiles';
import { useApp } from '../context/AppContext';
import { MapFile } from '../types';

interface FileManagerProps {
  className?: string;
}

export function FileManager({ className = '' }: FileManagerProps) {
  const { state, actions } = useApp();
  const { loadFilesFromFileList, saveMergedMap } = useFiles();
  const [dragActive, setDragActive] = useState(false);
  const [filename, setFilename] = useState('объединенная_карта.map');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Обработка выбора файлов через диалог
   */
  const handleFileSelect = useCallback(async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  /**
   * Обработка изменения input файлов
   */
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

  /**
   * Обработка drag events
   */
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

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        try {
          await loadFilesFromFileList(e.dataTransfer.files);
        } catch (error) {
          console.error('Ошибка загрузки файлов:', error);
        }
      }
    },
    [loadFilesFromFileList]
  );

  /**
   * Переключение видимости файла
   */
  const toggleFileVisibility = useCallback(
    (fileId: string) => {
      actions.toggleFileVisibility(fileId);
    },
    [actions]
  );

  /**
   * Переключение видимости карты
   */
  const toggleMapVisibility = useCallback(
    (fileId: string, mapType: 'gasoline' | 'gas') => {
      actions.toggleMapVisibility(fileId, mapType);
    },
    [actions]
  );

  /**
   * Выбор карты для объединения
   */
  const selectMap = useCallback(
    (fileId: string, mapType: 'gasoline' | 'gas') => {
      actions.selectMap(fileId, mapType);
    },
    [actions]
  );

  /**
   * Включение/отключение всех файлов
   */
  const toggleAllFiles = useCallback(
    (enable: boolean) => {
      state.files.forEach(file => {
        if (file.visible !== enable) {
          actions.toggleFileVisibility(file.id);
        }
      });
    },
    [state.files, actions]
  );

  /**
   * Сохранение объединенной карты
   */
  const handleSaveMergedMap = useCallback(async () => {
    if (!state.selectedGasolineMap || !state.selectedGasMap) {
      alert('Выберите бензиновую и газовую карты для объединения');
      return;
    }

    try {
      await saveMergedMap(filename);
      alert('Карта успешно сохранена!');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert(
        `Ошибка сохранения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      );
    }
  }, [
    state.selectedGasolineMap,
    state.selectedGasMap,
    filename,
    saveMergedMap,
  ]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Заголовок */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Управление файлами
        </h2>
      </div>

      {/* Кнопка выбора файлов */}
      <div className="mb-4">
        <button
          onClick={handleFileSelect}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Выбрать файлы
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

      {/* Drag & Drop область */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 mb-4 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <p className="mt-2 text-sm text-gray-600">
            Перетащите .map файлы сюда или{' '}
            <button
              onClick={handleFileSelect}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              выберите файлы
            </button>
          </p>
        </div>
      </div>

      {/* Список загруженных файлов */}
      {state.files.length > 0 && (
        <div className="flex-1 overflow-hidden">
          <div className="mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => toggleAllFiles(true)}
                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
              >
                Включить все
              </button>
              <button
                onClick={() => toggleAllFiles(false)}
                className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
              >
                Отключить все
              </button>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-96">
            {state.files.map(file => (
              <FileItem
                key={file.id}
                file={file}
                isSelectedGasoline={state.selectedGasolineMap === file.id}
                isSelectedGas={state.selectedGasMap === file.id}
                onToggleFileVisibility={toggleFileVisibility}
                onToggleMapVisibility={toggleMapVisibility}
                onSelectMap={selectMap}
              />
            ))}
          </div>
        </div>
      )}

      {/* Панель сохранения */}
      {state.files.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя файла:
            </label>
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="объединенная_карта.map"
            />
          </div>
          <button
            onClick={handleSaveMergedMap}
            disabled={
              !state.selectedGasolineMap ||
              !state.selectedGasMap ||
              state.isLoading
            }
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {state.isLoading ? 'Сохранение...' : 'Сохранить объединенную карту'}
          </button>
        </div>
      )}

      {/* Отображение ошибок */}
      {state.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {state.error}
        </div>
      )}
    </div>
  );
}

interface FileItemProps {
  file: MapFile;
  isSelectedGasoline: boolean;
  isSelectedGas: boolean;
  onToggleFileVisibility: (fileId: string) => void;
  onToggleMapVisibility: (fileId: string, mapType: 'gasoline' | 'gas') => void;
  onSelectMap: (fileId: string, mapType: 'gasoline' | 'gas') => void;
}

function FileItem({
  file,
  isSelectedGasoline,
  isSelectedGas,
  onToggleFileVisibility,
  onToggleMapVisibility,
  onSelectMap,
}: FileItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      {/* Заголовок файла */}
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={file.visible}
            onChange={() => onToggleFileVisibility(file.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </span>
        </label>
      </div>

      {/* Карты файла */}
      <div className="ml-6 space-y-2">
        {/* Бензиновая карта */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={file.gasolineVisible}
              onChange={() => onToggleMapVisibility(file.id, 'gasoline')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-blue-600">Бензин</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="radio"
              name="gasoline-map"
              checked={isSelectedGasoline}
              onChange={() => onSelectMap(file.id, 'gasoline')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500">Выбрать</span>
          </label>
        </div>

        {/* Газовая карта */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={file.gasVisible}
              onChange={() => onToggleMapVisibility(file.id, 'gas')}
              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <span className="text-sm text-yellow-600">Газ</span>
          </label>
          <label className="flex items-center space-x-1 cursor-pointer">
            <input
              type="radio"
              name="gas-map"
              checked={isSelectedGas}
              onChange={() => onSelectMap(file.id, 'gas')}
              className="text-yellow-600 focus:ring-yellow-500"
            />
            <span className="text-xs text-gray-500">Выбрать</span>
          </label>
        </div>
      </div>
    </div>
  );
}
