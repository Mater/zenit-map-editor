import { useCallback, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useFiles } from '../hooks/useFiles';
import { useMaps } from '../hooks/useMaps';
import { MapFile } from '../types';

interface ControlPanelProps {
  className?: string;
}

export function ControlPanel({ className = '' }: ControlPanelProps) {
  const { state, actions } = useApp();
  const { loadFilesFromFileList, saveMergedMap } = useFiles();
  const { canMergeMaps } = useMaps();

  const [filename, setFilename] = useState('бензиновая карта.map');
  const [dragActive, setDragActive] = useState(false);
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
   * Получение выбранных карт
   */
  const canMerge = canMergeMaps();

  /**
   * Сохранение объединенной карты
   */
  const handleSaveMergedMap = useCallback(async () => {
    if (!canMerge) {
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
  }, [canMerge, filename, saveMergedMap]);

  return (
    <div
      className={`flex flex-col min-h-full bg-white rounded-lg shadow-xl border border-gray-200 p-4 ${className} ${
        dragActive ? 'bg-blue-50 border-blue-300' : ''
      }`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Заголовок панели */}
      <div className="mb-4 pb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Загрузка и управление картами
        </h2>
      </div>

      {/* Кнопка выбора файлов */}
      <div className="mb-4">
        <button
          onClick={handleFileSelect}
          disabled={state.isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {state.isLoading ? 'Загрузка...' : 'Выбрать .map файлы'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".map"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          Поддерживаются файлы .map или перетащите файлы в панель
        </p>
      </div>

      {/* Список загруженных файлов */}
      {state.files.length > 0 ? (
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="mb-3 flex-shrink-0">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Загруженные файлы ({state.files.length}):
            </h3>
            <div className="flex gap-2 mb-3">
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

          <div className="flex-1 space-y-2">
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

            {/* Тестовые элементы для проверки прокрутки */}
            {state.files.length === 0 && (
              <>
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={`test-${i}`}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Тестовый файл {i + 1}.map
                    </div>
                    <div className="text-xs text-gray-500">
                      Это тестовый элемент для проверки прокрутки
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm">
              Перетащите .map файлы сюда или нажмите "Выбрать файлы"
            </p>
          </div>
        </div>
      )}

      {/* Панель сохранения */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Сохранение карты
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Имя файла:
            </label>
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="бензиновая карта.map"
            />
          </div>
          <button
            onClick={handleSaveMergedMap}
            disabled={!canMerge || state.isLoading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {state.isLoading ? 'Сохранение...' : 'Сохранить объединенную карту'}
          </button>
          {!canMerge && (
            <p className="text-xs text-gray-500 text-center">
              Выберите бензиновую и газовую карты для объединения
            </p>
          )}
        </div>
      </div>

      {/* Отображение ошибок */}
      {state.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
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
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
      {/* Заголовок файла */}
      <div className="mb-3">
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
      <div className="space-y-2">
        {/* Бензиновая карта */}
        <div className="flex items-center justify-between bg-white rounded p-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={file.gasolineVisible}
              onChange={() => onToggleMapVisibility(file.id, 'gasoline')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-blue-600 font-medium">Бензин</span>
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
        <div className="flex items-center justify-between bg-white rounded p-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={file.gasVisible}
              onChange={() => onToggleMapVisibility(file.id, 'gas')}
              className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <span className="text-sm text-yellow-600 font-medium">Газ</span>
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
