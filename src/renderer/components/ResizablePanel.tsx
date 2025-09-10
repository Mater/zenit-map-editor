import { useState, useRef, useCallback, useEffect } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  className?: string;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function ResizablePanel({
  children,
  className = '',
  initialWidth = 300,
  minWidth = 200,
  maxWidth = 500,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = startXRef.current - e.clientX; // Разделитель слева, инвертируем для правильного направления
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidthRef.current + deltaX)
      );
      setWidth(newWidth);
    },
    [isResizing, minWidth, maxWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.classList.remove('resizing');
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;

      // Добавляем класс для блокировки выделения текста
      document.body.classList.add('resizing');

      // Добавляем обработчики для всего документа
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [width, handleMouseMove, handleMouseUp]
  );

  // Очистка обработчиков при размонтировании
  useEffect(() => {
    return () => {
      document.body.classList.remove('resizing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className={`flex h-full ${className}`}>
      {/* Разделитель */}
      <div
        className={`w-3 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex-shrink-0 transition-all duration-150 relative group border-l border-r border-gray-300 ${
          isResizing ? 'bg-blue-400 shadow-lg' : ''
        }`}
        onMouseDown={handleMouseDown}
        title="Перетащите для изменения размера панели"
      >
        {/* Визуальная индикация для лучшего UX */}
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-500 group-hover:bg-gray-700 transition-colors" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-gray-500 group-hover:bg-gray-700 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-12 bg-gray-600 group-hover:bg-gray-800 rounded-full opacity-40 group-hover:opacity-80 transition-opacity" />
      </div>

      {/* Основная панель */}
      <div
        ref={panelRef}
        className="flex-shrink-0 overflow-y-auto"
        style={{ width: `${width}px` }}
      >
        {children}
      </div>
    </div>
  );
}
