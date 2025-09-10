import React from 'react';
import { useAppStore } from './store/useAppStore';
import FileManager from './components/FileManager';
import MapViewer from './components/MapViewer';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  const { error, clearError } = useAppStore();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Заголовок */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Zenit Map Editor</h1>
        <p className="text-sm text-gray-600 mt-1">
          Редактор топливных карт газобаллонного оборудования Zenit JZ 2009
        </p>
      </header>

      {/* Основной контент */}
      <main className="flex-1 flex overflow-hidden">
        {/* Левая панель - График */}
        <div className="flex-1 flex flex-col">
          <MapViewer />
        </div>

        {/* Правая панель - Управление */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <FileManager />
          <ControlPanel />
        </div>
      </main>

      {/* Уведомления об ошибках */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-md">
          <div className="flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button
              onClick={clearError}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
