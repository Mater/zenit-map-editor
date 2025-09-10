import { AppProvider } from './renderer/context/AppContext';
import { MapViewer, ControlPanel, ResizablePanel } from './renderer/components';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="h-screen bg-gray-100 flex flex-col">
        <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Zenit JZ 2009 Map Editor
          </h1>
        </header>

        <main className="flex-1 p-6 h-full">
          <div className="h-full flex gap-6">
            {/* Левая колонка - Визуализация карт */}
            <div className="flex-1 min-w-0">
              <MapViewer className="h-full" />
            </div>

            {/* Правая колонка - Панель управления файлами с возможностью изменения размера */}
            <ResizablePanel initialWidth={300} minWidth={200} maxWidth={500}>
              <ControlPanel />
            </ResizablePanel>
          </div>
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
