import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

export function useMaps() {
  const { state } = useApp();

  /**
   * Получение выбранных карт
   */
  const getSelectedMaps = useCallback(() => {
    const gasolineFile = state.files.find(
      file => file.id === state.selectedGasolineMap
    );
    const gasFile = state.files.find(file => file.id === state.selectedGasMap);

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

  return {
    canMergeMaps,
  };
}
