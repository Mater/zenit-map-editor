/**
 * Топливная точка на карте
 */
export interface FuelPoint {
  x: number; // Давление в коллекторе (мбар)
  y: number; // Время впрыска (мс)
}

/**
 * Топливная карта (бензин или газ)
 */
export interface FuelMap {
  points: FuelPoint[];
  type: 'gasoline' | 'gas';
}

/**
 * Загруженный файл карты
 */
export interface MapFile {
  id: string;
  name: string;
  path: string;
  gasolineMap: FuelMap;
  gasMap: FuelMap;
  isVisible: boolean;
  gasolineVisible: boolean;
  gasVisible: boolean;
}

/**
 * Состояние приложения
 */
export interface AppState {
  files: MapFile[];
  selectedGasolineMap: string | null;
  selectedGasMap: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Действия для управления состоянием
 */
export type AppAction =
  | { type: 'ADD_FILES'; payload: MapFile[] }
  | { type: 'REMOVE_FILE'; payload: string }
  | { type: 'TOGGLE_FILE_VISIBILITY'; payload: string }
  | {
      type: 'TOGGLE_MAP_VISIBILITY';
      payload: { fileId: string; mapType: 'gasoline' | 'gas' };
    }
  | { type: 'SELECT_GASOLINE_MAP'; payload: string | null }
  | { type: 'SELECT_GAS_MAP'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

/**
 * Параметры для сохранения объединенной карты
 */
export interface SaveOptions {
  defaultPath?: string;
  gasolineMapId: string;
  gasMapId: string;
}
