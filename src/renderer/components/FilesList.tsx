import { useApp } from '../context/AppContext';
import { FileItem } from '../components/FileItem';

export function FilesList() {
  const { state, actions } = useApp();
  const toggleAllFiles = (visible: boolean) => {
    state.files.forEach(file => {
      if (file.visible !== visible) {
        actions.toggleFileVisibility(file.id);
      }
    });
  };

  if (state.files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm text-gray-500">Файлы не загружены</p>
          <p className="text-xs text-gray-400 mt-1">
            Загрузите .map файлы для начала работы
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="mb-3 flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Загруженные файлы ({state.files.length}):
        </h3>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => toggleAllFiles(true)}
            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
          >
            Показать все
          </button>
          <button
            onClick={() => toggleAllFiles(false)}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Скрыть все
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {state.files.map(file => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
}
