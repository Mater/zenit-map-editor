import React from 'react';
import { AppProvider } from './renderer/context/AppContext';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Zenit Map Editor
            </h1>
            <p className="text-gray-600 mt-2">
              Редактор топливных карт газобаллонного оборудования Zenit JZ 2009
            </p>
          </header>

          <main className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Базовая архитектура готова
              </h2>
              <p className="text-gray-600 mb-6">Этап 2 завершен. Созданы:</p>
              <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
                <li>✅ React Context для управления состоянием</li>
                <li>✅ TypeScript типы для карт и файлов</li>
                <li>✅ FileService для работы с .map файлами</li>
                <li>✅ MapService для Canvas визуализации</li>
                <li>✅ Electron IPC коммуникация</li>
                <li>✅ Базовые хуки useFiles и useMaps</li>
              </ul>
              <p className="text-gray-500 mt-6 text-sm">
                Готов к переходу на Этап 3: UI компоненты
              </p>
            </div>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
