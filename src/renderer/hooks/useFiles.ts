import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { FileService } from '../services/FileService';

export function useFiles() {
  const { state, actions } = useApp();

  /**
   * Проверка на дубликаты файлов по именам
   */
  const checkForDuplicatesByName = useCallback(
    (fileNames: string[]): string[] => {
      const existingFileNames = state.files.map(file =>
        file.name.toLowerCase()
      );
      const uniqueFiles: string[] = [];

      fileNames.forEach(fileName => {
        const lowerFileName = fileName.toLowerCase();
        if (!existingFileNames.includes(lowerFileName)) {
          uniqueFiles.push(fileName);
        }
      });

      return uniqueFiles;
    },
    [state.files]
  );

  /**
   * Проверка на дубликаты файлов (File объекты)
   */
  const checkForDuplicates = useCallback(
    (newFiles: File[]): File[] => {
      const fileNames = newFiles.map(file => file.name);
      const uniqueFileNames = checkForDuplicatesByName(fileNames);

      return newFiles.filter(file => uniqueFileNames.includes(file.name));
    },
    [checkForDuplicatesByName]
  );

  /**
   * Загрузка файлов через File API (для drag & drop)
   */
  const loadFilesFromFileList = useCallback(
    async (files: FileList) => {
      try {
        const fileArray = Array.from(files);

        // Проверяем на дубликаты
        const uniqueFiles = checkForDuplicates(fileArray);

        // Если все файлы дубликаты, выходим
        if (uniqueFiles.length === 0) {
          return;
        }

        await actions.loadFiles(uniqueFiles);
      } catch (error) {
        console.error('Ошибка загрузки файлов:', error);
        throw error;
      }
    },
    [actions, checkForDuplicates]
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
          file => file.id === state.selectedGasolineMap
        );
        const gasFile = state.files.find(
          file => file.id === state.selectedGasMap
        );

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

  return {
    files: state.files,
    isLoading: state.isLoading,
    error: state.error,
    loadFilesFromFileList,
    saveMergedMap,
    toggleFileVisibility: actions.toggleFileVisibility,
    toggleMapVisibility: actions.toggleMapVisibility,
    selectMap: actions.selectMap,
  };
}
