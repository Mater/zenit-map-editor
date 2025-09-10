export interface MapPoint {
  x: number; // давление (мбар)
  y: number; // время впрыска (мс)
}

export interface FuelMap {
  gasoline: MapPoint[];
  gas: MapPoint[];
}

export interface MapFile {
  id: string;
  name: string;
  path: string;
  data: FuelMap;
  visible: boolean;
  gasolineVisible: boolean;
  gasVisible: boolean;
}

export interface AppState {
  files: MapFile[];
  selectedGasolineMap: string | null;
  selectedGasMap: string | null;
  activeFile: string | null; // ID активного файла для подсветки
  isLoading: boolean;
  error: string | null;
}

export interface AppActions {
  loadFiles: (files: File[]) => Promise<void>;
  toggleFileVisibility: (fileId: string) => void;
  toggleMapVisibility: (fileId: string, mapType: 'gasoline' | 'gas') => void;
  selectMap: (fileId: string, mapType: 'gasoline' | 'gas') => void;
  setActiveFile: (fileId: string | null) => void;
  deleteFile: (fileId: string) => void;
  saveMergedMap: (filename: string) => Promise<void>;
}
