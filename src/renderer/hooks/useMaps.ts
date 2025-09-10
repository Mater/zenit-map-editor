import { useCallback, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapService, CanvasConfig } from '../services/MapService';

export function useMaps() {
  const { state } = useApp();
  const mapServiceRef = useRef<MapService | null>(null);

  /**
   * Инициализация MapService
   */
  const initializeMapService = useCallback(
    (canvas: HTMLCanvasElement, config?: Partial<CanvasConfig>) => {
      try {
        mapServiceRef.current = new MapService(canvas, config);
        return mapServiceRef.current;
      } catch (error) {
        console.error('Ошибка инициализации MapService:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Отрисовка карт
   */
  const renderMaps = useCallback(() => {
    if (!mapServiceRef.current) {
      console.warn('MapService не инициализирован');
      return;
    }

    try {
      mapServiceRef.current.render(state.files, state.activeFile);
    } catch (error) {
      console.error('Ошибка отрисовки карт:', error);
    }
  }, [state.files, state.activeFile]);

  /**
   * Получение точки под курсором
   */
  const getPointAt = useCallback(
    (screenX: number, screenY: number) => {
      if (!mapServiceRef.current) {
        return null;
      }

      try {
        return mapServiceRef.current.getPointAt(screenX, screenY, state.files);
      } catch (error) {
        console.error('Ошибка получения точки:', error);
        return null;
      }
    },
    [state.files]
  );

  /**
   * Преобразование координат из экранных в логические
   */
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    if (!mapServiceRef.current) {
      return { x: 0, y: 0 };
    }

    try {
      return mapServiceRef.current.screenToWorld(screenX, screenY);
    } catch (error) {
      console.error('Ошибка преобразования координат:', error);
      return { x: 0, y: 0 };
    }
  }, []);

  /**
   * Обновление конфигурации Canvas
   */
  const updateCanvasConfig = useCallback((config: Partial<CanvasConfig>) => {
    if (!mapServiceRef.current) {
      console.warn('MapService не инициализирован');
      return;
    }

    try {
      mapServiceRef.current.updateConfig(config);
    } catch (error) {
      console.error('Ошибка обновления конфигурации:', error);
    }
  }, []);

  /**
   * Получение текущей конфигурации
   */
  const getCanvasConfig = useCallback((): CanvasConfig | null => {
    if (!mapServiceRef.current) {
      return null;
    }

    try {
      return mapServiceRef.current.getConfig();
    } catch (error) {
      console.error('Ошибка получения конфигурации:', error);
      return null;
    }
  }, []);

  /**
   * Очистка Canvas
   */
  const clearCanvas = useCallback(() => {
    if (!mapServiceRef.current) {
      return;
    }

    try {
      mapServiceRef.current.clear();
    } catch (error) {
      console.error('Ошибка очистки Canvas:', error);
    }
  }, []);

  /**
   * Получение видимых карт
   */
  const getVisibleMaps = useCallback(() => {
    return state.files.filter(file => file.visible);
  }, [state.files]);

  /**
   * Получение выбранных карт
   */
  const getSelectedMaps = useCallback(() => {
    const gasolineFile = state.files.find(
      f => f.id === state.selectedGasolineMap
    );
    const gasFile = state.files.find(f => f.id === state.selectedGasMap);

    return {
      gasoline: gasolineFile || null,
      gas: gasFile || null,
    };
  }, [state.files, state.selectedGasolineMap, state.selectedGasMap]);

  /**
   * Проверка возможности объединения карт
   */
  const canMergeMaps = useCallback(() => {
    const selectedMaps = getSelectedMaps();
    return selectedMaps.gasoline !== null && selectedMaps.gas !== null;
  }, [getSelectedMaps]);

  /**
   * Получение статистики по видимым картам
   */
  const getVisibleMapsStats = useCallback(() => {
    const visibleFiles = getVisibleMaps();

    return visibleFiles.map(file => ({
      id: file.id,
      name: file.name,
      gasolinePoints: file.gasolineVisible ? file.data.gasoline.length : 0,
      gasPoints: file.gasVisible ? file.data.gas.length : 0,
      totalPoints:
        (file.gasolineVisible ? file.data.gasoline.length : 0) +
        (file.gasVisible ? file.data.gas.length : 0),
    }));
  }, [getVisibleMaps]);

  /**
   * Автоматическая перерисовка при изменении файлов
   */
  useEffect(() => {
    if (mapServiceRef.current) {
      renderMaps();
    }
  }, [renderMaps]);

  return {
    // Основные методы
    initializeMapService,
    renderMaps,
    getPointAt,
    screenToWorld,
    updateCanvasConfig,
    getCanvasConfig,
    clearCanvas,

    // Данные
    files: state.files,
    getVisibleMaps,
    getSelectedMaps,
    canMergeMaps,
    getVisibleMapsStats,

    // Состояние
    isLoading: state.isLoading,
    error: state.error,
  };
}
