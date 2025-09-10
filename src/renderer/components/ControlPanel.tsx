import { FileUpload } from './FileUpload';
import { FilesList } from './FilesList';
import { SavePanel } from './SavePanel';

interface ControlPanelProps {
  className?: string;
}

export function ControlPanel({ className = '' }: ControlPanelProps) {
  return (
    <FileUpload
      className={`flex flex-col min-h-full bg-white rounded-lg shadow-xl border border-gray-200 p-4 ${className}`}
    >
      {/* Список файлов */}
      <FilesList />

      {/* Панель сохранения */}
      <SavePanel />
    </FileUpload>
  );
}
