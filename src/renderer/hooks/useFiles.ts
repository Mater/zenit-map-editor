import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { FileService } from '../services/FileService';
import { MapFile } from '../types';

export function useFiles() {
  const { state, actions } = useApp();

  /**
   * Загрузка файлов через диалог
   */
  const loadFilesFromDialog = useCallback(async () => {
    try {
      if (!window.electronAPI) {
        throw new Error('Electron API недоступен');
      }

      const filePaths = await window.electronAPI.openFileDialog();

      if (filePaths.length === 0) {
        return;
      }

      // Читаем содержимое файлов
      const fileContents = await Promise.all(
        filePaths.map(async filePath => {
          const result = await window.electronAPI.readFile(filePath);
          if (!result.success || !result.content) {
            throw new Error(`Ошибка чтения файла ${filePath}: ${result.error}`);
          }
          return {
            path: filePath,
            content: result.content,
            name: filePath.split('/').pop() || filePath,
          };
        })
      );

      // Парсим файлы и создаем MapFile объекты
      const mapFiles: MapFile[] = await Promise.all(
        fileContents.map(async (file, index) => {
          try {
            const data = FileService.parseMapFile(file.content);
            return {
              id: `file-${index}-${Date.now()}`,
              name: file.name,
              path: file.path,
              data,
              visible: true,
              gasolineVisible: true,
              gasVisible: true,
            };
          } catch (error) {
            throw new Error(
              `Ошибка парсинга файла ${file.name}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
            );
          }
        })
      );

      await actions.loadFiles([]); // Очищаем текущие файлы
      // Добавляем новые файлы через dispatch
      mapFiles.forEach(file => {
        // Здесь нужно будет обновить AppContext для поддержки добавления отдельных файлов
        // Пока используем временное решение
      });
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error);
      throw error;
    }
  }, [actions]);

  /**
   * Загрузка файлов через File API (для drag & drop)
   */
  const loadFilesFromFileList = useCallback(
    async (files: FileList) => {
      try {
        const fileArray = Array.from(files);
        const mapFiles: MapFile[] = [];

        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];

          // Проверяем расширение файла
          if (!file.name.toLowerCase().endsWith('.map')) {
            throw new Error(`Файл ${file.name} не является .map файлом`);
          }

          try {
            const mapFile = await FileService.createMapFile(
              file,
              `file-${i}-${Date.now()}`
            );
            mapFiles.push(mapFile);
          } catch (error) {
            throw new Error(
              `Ошибка обработки файла ${file.name}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
            );
          }
        }

        await actions.loadFiles(fileArray);
      } catch (error) {
        console.error('Ошибка загрузки файлов:', error);
        throw error;
      }
    },
    [actions]
  );

  /**
   * Сохранение объединенной карты
   */
  const saveMergedMap = useCallback(
    async (filename: string = 'объединенная_карта.map') => {
      try {
        if (!window.electronAPI) {
          throw new Error('Electron API недоступен');
        }

        const gasolineFile = state.files.find(
          f => f.id === state.selectedGasolineMap
        );
        const gasFile = state.files.find(f => f.id === state.selectedGasMap);

        if (!gasolineFile || !gasFile) {
          throw new Error(
            'Не выбраны бензиновая или газовая карта для объединения'
          );
        }

        const mergedContent = FileService.createMergedFile(
          gasolineFile,
          gasFile
        );

        const result = await window.electronAPI.saveFile(
          mergedContent,
          filename
        );

        if (!result.success) {
          throw new Error(result.error || 'Ошибка сохранения файла');
        }

        return result.path;
      } catch (error) {
        console.error('Ошибка сохранения файла:', error);
        throw error;
      }
    },
    [state.files, state.selectedGasolineMap, state.selectedGasMap]
  );

  /**
   * Получение статистики по файлам
   */
  const getFilesStats = useCallback(() => {
    return state.files.map(file => ({
      id: file.id,
      name: file.name,
      gasolineStats: FileService.getMapStats(file.data.gasoline),
      gasStats: FileService.getMapStats(file.data.gas),
      visible: file.visible,
      gasolineVisible: file.gasolineVisible,
      gasVisible: file.gasVisible,
    }));
  }, [state.files]);

  /**
   * Валидация файла
   */
  const validateFile = useCallback((content: string): boolean => {
    return FileService.validateMapFile(content);
  }, []);

  /**
   * Очистка всех файлов
   */
  const clearFiles = useCallback(() => {
    // Нужно добавить действие в AppContext
    console.log('Очистка файлов');
  }, []);

  return {
    files: state.files,
    isLoading: state.isLoading,
    error: state.error,
    loadFilesFromDialog,
    loadFilesFromFileList,
    saveMergedMap,
    getFilesStats,
    validateFile,
    clearFiles,
    toggleFileVisibility: actions.toggleFileVisibility,
    toggleMapVisibility: actions.toggleMapVisibility,
    selectMap: actions.selectMap,
  };
}
