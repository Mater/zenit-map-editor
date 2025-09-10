import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useFiles } from '../hooks/useFiles';
import { useMaps } from '../hooks/useMaps';

export function SavePanel() {
  const { state } = useApp();
  const { saveMergedMap } = useFiles();
  const { canMergeMaps } = useMaps();

  const [filename, setFilename] = useState('имя_файлаM.map');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Генерация имени файла на основе выбранной газовой карты или первого файла
   */
  const generateFilename = useCallback(() => {
    // Если выбрана газовая карта, используем её имя
    if (state.selectedGasMap) {
      const selectedFile = state.files.find(
        file => file.id === state.selectedGasMap
      );
      if (selectedFile) {
        const baseName = selectedFile.name.replace(/\.map$/i, '');
        return `${baseName}M.map`;
      }
    }

    // Если есть файлы, используем имя первого файла
    if (state.files.length > 0) {
      const firstFile = state.files[0];
      const baseName = firstFile.name.replace(/\.map$/i, '');
      return `${baseName}M.map`;
    }

    // По умолчанию
    return '';
  }, [state.selectedGasMap, state.files]);

  /**
   * Автоматическое обновление имени файла при изменении выбранной карты или файлов
   */
  useEffect(() => {
    const newFilename = generateFilename();
    setFilename(newFilename);
  }, [generateFilename]);

  const canMerge = canMergeMaps() && filename.trim().length > 0;

  const handleSave = async () => {
    if (!canMerge || state.isLoading || isSaving) return;

    setIsSaving(true);
    try {
      await saveMergedMap(filename);
      console.log('Файл успешно сохранен');
    } catch (error) {
      console.error('Ошибка сохранения файла:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        Сохранение карты
      </h4>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Имя файла:</label>
          <input
            type="text"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="имя_файла.map"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!canMerge || state.isLoading || isSaving}
          className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить объединенную карту'}
        </button>
        {!canMerge && !state.isLoading && (
          <p className="text-xs text-gray-500">
            Для сохранения выберите одну бензиновую и одну газовую карту
          </p>
        )}
      </div>

      {state.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {state.error}
        </div>
      )}
    </div>
  );
}
