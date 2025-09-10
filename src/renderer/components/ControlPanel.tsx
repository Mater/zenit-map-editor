import { FileUpload } from './FileUpload';
import { FilesList } from './FilesList';
import { SavePanel } from './SavePanel';

interface ControlPanelProps {
  className?: string;
}

export function ControlPanel({ className = '' }: ControlPanelProps) {
  return (
    <div
      className={`flex flex-col min-h-full bg-white rounded-lg shadow-xl border border-gray-200 p-4 ${className}`}
    >
      {/* Заголовок */}
      <div className="mb-4 pb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Загрузка и управление картами
        </h2>
      </div>

      {/* Загрузка файлов */}
      <FileUpload />

      {/* Список файлов */}
      <FilesList />

      {/* Панель сохранения */}
      <SavePanel />
    </div>
  );
}
