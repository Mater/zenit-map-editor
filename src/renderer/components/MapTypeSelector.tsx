import { MapFile } from '../types';
import { useApp } from '../context/AppContext';

interface MapTypeSelectorProps {
  file: MapFile;
}

export function MapTypeSelector({ file }: MapTypeSelectorProps) {
  const { state, actions } = useApp();

  const isSelectedGasoline = state.selectedGasolineMap === file.id;
  const isSelectedGas = state.selectedGasMap === file.id;
  return (
    <div className="space-y-2" onClick={e => e.stopPropagation()}>
      {/* Бензиновая карта */}
      <div className="flex items-center justify-between bg-white rounded p-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={file.gasolineVisible}
            onChange={() => actions.toggleMapVisibility(file.id, 'gasoline')}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-blue-600 font-medium">Бензин</span>
        </label>
        <button
          className="flex items-center space-x-1 cursor-pointer group p-1 rounded hover:bg-blue-50 transition-colors"
          onClick={() => actions.selectMap(file.id, 'gasoline')}
        >
          <svg
            className={`w-4 h-4 transition-colors ${
              isSelectedGasoline
                ? 'text-blue-600'
                : 'text-gray-400 group-hover:text-blue-600'
            }`}
            fill={isSelectedGasoline ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
            />
          </svg>
        </button>
      </div>

      {/* Газовая карта */}
      <div className="flex items-center justify-between bg-white rounded p-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={file.gasVisible}
            onChange={() => actions.toggleMapVisibility(file.id, 'gas')}
            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
          />
          <span className="text-sm text-yellow-600 font-medium">Газ</span>
        </label>
        <button
          className="flex items-center space-x-1 cursor-pointer group p-1 rounded hover:bg-yellow-50 transition-colors"
          onClick={() => actions.selectMap(file.id, 'gas')}
        >
          <svg
            className={`w-4 h-4 transition-colors ${
              isSelectedGas
                ? 'text-yellow-600'
                : 'text-gray-400 group-hover:text-yellow-600'
            }`}
            fill={isSelectedGas ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
