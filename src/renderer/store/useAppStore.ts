import { create } from 'zustand';
import { AppState, AppAction, MapFile } from '@/shared/types';

interface AppStore extends AppState {
  // Actions
  addFiles: (files: MapFile[]) => void;
  removeFile: (fileId: string) => void;
  toggleFileVisibility: (fileId: string) => void;
  toggleMapVisibility: (fileId: string, mapType: 'gasoline' | 'gas') => void;
  selectGasolineMap: (fileId: string | null) => void;
  selectGasMap: (fileId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: AppState = {
  files: [],
  selectedGasolineMap: null,
  selectedGasMap: null,
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  addFiles: files => {
    set(state => ({
      files: [...state.files, ...files],
      error: null,
    }));
  },

  removeFile: fileId => {
    set(state => {
      const newFiles = state.files.filter(file => file.id !== fileId);
      const newSelectedGasoline =
        state.selectedGasolineMap === fileId ? null : state.selectedGasolineMap;
      const newSelectedGas =
        state.selectedGasMap === fileId ? null : state.selectedGasMap;

      return {
        files: newFiles,
        selectedGasolineMap: newSelectedGasoline,
        selectedGasMap: newSelectedGas,
      };
    });
  },

  toggleFileVisibility: fileId => {
    set(state => ({
      files: state.files.map(file =>
        file.id === fileId ? { ...file, isVisible: !file.isVisible } : file
      ),
    }));
  },

  toggleMapVisibility: (fileId, mapType) => {
    set(state => ({
      files: state.files.map(file =>
        file.id === fileId
          ? {
              ...file,
              [mapType === 'gasoline' ? 'gasolineVisible' : 'gasVisible']:
                !file[
                  mapType === 'gasoline' ? 'gasolineVisible' : 'gasVisible'
                ],
            }
          : file
      ),
    }));
  },

  selectGasolineMap: fileId => {
    set({ selectedGasolineMap: fileId });
  },

  selectGasMap: fileId => {
    set({ selectedGasMap: fileId });
  },

  setLoading: loading => {
    set({ isLoading: loading });
  },

  setError: error => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));
