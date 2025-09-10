import { MapFile } from '../types';
import { useApp } from '../context/AppContext';
import { MapTypeSelector } from './MapTypeSelector';

export interface FileItemProps {
  file: MapFile;
}

export function FileItem({ file }: FileItemProps) {
  const { state, actions } = useApp();

  const isActive = state.activeFile === file.id;
  return (
    <div
      className={`border rounded-lg p-3 transition-colors cursor-pointer ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
      }`}
      onClick={() => actions.setActiveFile(file.id)}
    >
      {/* Заголовок файла */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer flex-1 min-w-0">
          <input
            type="checkbox"
            checked={file.visible}
            onClick={e => e.stopPropagation()}
            onChange={() => actions.toggleFileVisibility(file.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span
            className={`text-sm font-medium truncate ${
              isActive ? 'text-blue-900' : 'text-gray-900'
            }`}
          >
            {file.name}
          </span>
        </div>
        <button
          onClick={e => {
            e.stopPropagation();
            actions.deleteFile(file.id);
          }}
          className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          title="Удалить файл"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Карты файла */}
      <MapTypeSelector file={file} />
    </div>
  );
}
