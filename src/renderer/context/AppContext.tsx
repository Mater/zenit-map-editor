import { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppActions, MapFile } from '../types';
import { FileService } from '../services/FileService';

// Начальное состояние
const initialState: AppState = {
  files: [],
  selectedGasolineMap: null,
  selectedGasMap: null,
  activeFile: null,
  isLoading: false,
  error: null,
};

// Типы действий
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_FILES'; payload: MapFile[] }
  | { type: 'TOGGLE_FILE_VISIBILITY'; payload: string }
  | {
      type: 'TOGGLE_MAP_VISIBILITY';
      payload: { fileId: string; mapType: 'gasoline' | 'gas' };
    }
  | {
      type: 'SELECT_MAP';
      payload: { fileId: string; mapType: 'gasoline' | 'gas' };
    }
  | { type: 'SET_ACTIVE_FILE'; payload: string | null }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'CLEAR_FILES' };

// Reducer для управления состоянием
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_FILES':
      return { ...state, files: [...state.files, ...action.payload] };

    case 'TOGGLE_FILE_VISIBILITY':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload
            ? { ...file, visible: !file.visible }
            : file
        ),
      };

    case 'TOGGLE_MAP_VISIBILITY':
      return {
        ...state,
        files: state.files.map(file =>
          file.id === action.payload.fileId
            ? {
                ...file,
                [action.payload.mapType === 'gasoline'
                  ? 'gasolineVisible'
                  : 'gasVisible']:
                  !file[
                    action.payload.mapType === 'gasoline'
                      ? 'gasolineVisible'
                      : 'gasVisible'
                  ],
              }
            : file
        ),
      };

    case 'SELECT_MAP':
      return {
        ...state,
        [action.payload.mapType === 'gasoline'
          ? 'selectedGasolineMap'
          : 'selectedGasMap']: action.payload.fileId,
      };

    case 'SET_ACTIVE_FILE':
      return {
        ...state,
        activeFile: action.payload,
      };

    case 'DELETE_FILE':
      const fileToDelete = state.files.find(file => file.id === action.payload);
      const newFiles = state.files.filter(file => file.id !== action.payload);

      // Очищаем выбранные карты и активный файл, если удаляемый файл был выбран
      let newSelectedGasolineMap = state.selectedGasolineMap;
      let newSelectedGasMap = state.selectedGasMap;
      let newActiveFile = state.activeFile;

      if (fileToDelete && state.selectedGasolineMap === fileToDelete.id) {
        newSelectedGasolineMap = null;
      }
      if (fileToDelete && state.selectedGasMap === fileToDelete.id) {
        newSelectedGasMap = null;
      }
      if (fileToDelete && state.activeFile === fileToDelete.id) {
        newActiveFile = null;
      }

      return {
        ...state,
        files: newFiles,
        selectedGasolineMap: newSelectedGasolineMap,
        selectedGasMap: newSelectedGasMap,
        activeFile: newActiveFile,
      };

    case 'CLEAR_FILES':
      return {
        ...state,
        files: [],
        selectedGasolineMap: null,
        selectedGasMap: null,
        activeFile: null,
      };

    default:
      return state;
  }
}

// Создание контекста
const AppContext = createContext<{
  state: AppState;
  actions: AppActions;
} | null>(null);

// Провайдер контекста
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Действия
  const actions: AppActions = {
    loadFiles: async (files: File[]) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const mapFiles: MapFile[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

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

        dispatch({ type: 'ADD_FILES', payload: mapFiles });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error.message : 'Неизвестная ошибка',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    toggleFileVisibility: (fileId: string) => {
      dispatch({ type: 'TOGGLE_FILE_VISIBILITY', payload: fileId });
    },

    toggleMapVisibility: (fileId: string, mapType: 'gasoline' | 'gas') => {
      dispatch({ type: 'TOGGLE_MAP_VISIBILITY', payload: { fileId, mapType } });
    },

    selectMap: (fileId: string, mapType: 'gasoline' | 'gas') => {
      dispatch({ type: 'SELECT_MAP', payload: { fileId, mapType } });
    },

    setActiveFile: (fileId: string | null) => {
      dispatch({ type: 'SET_ACTIVE_FILE', payload: fileId });
    },

    deleteFile: (fileId: string) => {
      dispatch({ type: 'DELETE_FILE', payload: fileId });
    },

    saveMergedMap: async (filename: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        // TODO: Реализовать сохранение в FileService
        console.log('Сохранение объединенной карты:', filename);
        // Временная заглушка
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Ошибка сохранения',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Хук для использования контекста
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp должен использоваться внутри AppProvider');
  }
  return context;
}
