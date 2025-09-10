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
  const isResizingRef = useRef(false);

  // Используем useRef для стабильных обработчиков
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      // Предотвращаем выделение текста
      e.preventDefault();
      e.stopPropagation();

      const deltaX = startXRef.current - e.clientX;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidthRef.current + deltaX)
      );
      setWidth(newWidth);
    },
    [minWidth, maxWidth]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      isResizingRef.current = false;
      setIsResizing(false);
      document.body.classList.remove('resizing');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      // Убираем обработчики
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('mouseup', handleMouseUp, true);

      // Также убираем обработчики для случая, если мышь вышла за пределы окна
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
    },
    [handleMouseMove]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      isResizingRef.current = true;
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;

      // Добавляем стили для блокировки выделения текста и улучшения производительности
      document.body.classList.add('resizing');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';

      // Добавляем обработчики с capture=true для лучшего перехвата событий
      document.addEventListener('mousemove', handleMouseMove, true);
      document.addEventListener('mouseup', handleMouseUp, true);

      // Дополнительно добавляем на window для случая выхода за пределы окна
      window.addEventListener('mousemove', handleMouseMove, true);
      window.addEventListener('mouseup', handleMouseUp, true);
    },
    [width, handleMouseMove, handleMouseUp]
  );

  // Очистка обработчиков при размонтировании
  useEffect(() => {
    return () => {
      isResizingRef.current = false;
      document.body.classList.remove('resizing');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className={`flex h-full ${className}`}>
      {/* Разделитель */}
      <div
        className={`w-3 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex-shrink-0 transition-all duration-150 relative group border-l border-r border-gray-300 select-none ${
          isResizing ? 'bg-blue-400 shadow-lg' : ''
        }`}
        onMouseDown={handleMouseDown}
        onDragStart={e => e.preventDefault()} // Предотвращаем drag
        title="Перетащите для изменения размера панели"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
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
