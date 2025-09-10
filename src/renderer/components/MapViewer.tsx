import { useRef, useEffect, useCallback, useState } from 'react';
import { useMaps } from '../hooks/useMaps';
import { useApp } from '../context/AppContext';

interface MapViewerProps {
  className?: string;
}

export function MapViewer({ className = '' }: MapViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useApp();
  const { initializeMapService, getPointAt, screenToWorld, renderMaps } =
    useMaps();

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    file: string;
    type: 'gasoline' | 'gas';
  } | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  /**
   * Обновление размеров Canvas при изменении размера контейнера
   */
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const rect = container.getBoundingClientRect();
          const newWidth = Math.max(200, rect.width - 4); // -4 для border
          const newHeight = Math.max(200, rect.height - 4);
          setCanvasSize({ width: newWidth, height: newHeight });
        }
      }
    };

    // Используем ResizeObserver для более точного отслеживания изменений размера
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      resizeObserver.disconnect();
    };
  }, []);

  /**
   * Инициализация Canvas и MapService
   */
  useEffect(() => {
    if (canvasRef.current && canvasSize.width > 0 && canvasSize.height > 0) {
      try {
        initializeMapService(canvasRef.current, {
          width: canvasSize.width,
          height: canvasSize.height,
          padding: 50,
          gridSize: 20,
          pointRadius: 4,
          colors: {
            gasoline: '#3B82F6', // синий
            gas: '#F59E0B', // желтый
            grid: '#E5E7EB', // серый
            axis: '#374151', // темно-серый
            text: '#111827', // черный
          },
        });

        // Сразу отрисовываем пустую диаграмму с сеткой и осями
        renderMaps();
      } catch (error) {
        console.error('Ошибка инициализации MapService:', error);
      }
    }
  }, [initializeMapService, renderMaps, canvasSize.width, canvasSize.height]);

  /**
   * Перерисовка при изменении файлов или активного файла
   */
  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      renderMaps();
    }
  }, [renderMaps, canvasSize.width, canvasSize.height, state.activeFile]);

  /**
   * Обработка движения мыши для показа информации о точках
   */
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const point = getPointAt(x, y);
      if (point) {
        setHoveredPoint({
          x: point.point.x,
          y: point.point.y,
          file: point.file.name,
          type: point.type,
        });
      } else {
        setHoveredPoint(null);
      }
    },
    [getPointAt]
  );

  /**
   * Обработка клика по Canvas
   */
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const worldPos = screenToWorld(x, y);
      console.log('Клик по координатам:', worldPos);
    },
    [screenToWorld]
  );

  /**
   * Обработка выхода мыши из Canvas
   */
  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Canvas область */}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="block cursor-crosshair w-full h-full"
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
          onMouseLeave={handleMouseLeave}
        />

        {/* Информация о точке при наведении */}
        {hoveredPoint && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            <div>Файл: {hoveredPoint.file}</div>
            <div>
              Тип: {hoveredPoint.type === 'gasoline' ? 'Бензин' : 'Газ'}
            </div>
            <div>Давление: {hoveredPoint.x.toFixed(1)} мбар</div>
            <div>Время впрыска: {hoveredPoint.y.toFixed(1)} мс</div>
          </div>
        )}

        {/* Легенда рядом с осью Y */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-3 py-2 rounded border">
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 border border-black"></div>
              <span>Бензин</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 border border-black"></div>
              <span>Газ</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 border-2 border-red-500"></div>
              <span className="text-xs text-gray-600">Активный файл</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
