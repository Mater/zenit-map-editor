import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { MapPoint } from '../types';

interface MapViewerProps {
  className?: string;
}

interface Point {
  x: number;
  y: number;
  fileId: string;
  fileName: string;
  type: 'gasoline' | 'gas';
  visible: boolean;
  isActive: boolean;
}

// Статичные размеры для viewBox (не изменяются)
const SVG_DIMENSIONS = {
  width: 1000,
  height: 600,
  padding: { top: 40, right: 80, bottom: 60, left: 80 },
};

export function MapViewer({ className = '' }: MapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { state } = useApp();

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    file: string;
    type: 'gasoline' | 'gas';
  } | null>(null);

  const [dataExtent, setDataExtent] = useState({
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
  });

  // Настройки отображения
  const config = {
    padding: 50,
    gridSize: 20,
    pointRadius: 4,
    colors: {
      gasoline: '#3B82F6',
      gas: '#F59E0B',
      grid: '#E5E7EB',
      axis: '#374151',
      text: '#111827',
      activePoint: '#EF4444',
    },
  };

  // Функции масштабирования (scales)
  const scales = useMemo(() => {
    const { width, height, padding } = SVG_DIMENSIONS;
    const { xMin, xMax, yMin, yMax } = dataExtent;

    // Вычисляем рабочую область (без отступов)
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Создаем линейные масштабы
    const xScale = (dataX: number) => {
      const normalized = (dataX - xMin) / (xMax - xMin);
      return padding.left + normalized * plotWidth;
    };

    const yScale = (dataY: number) => {
      const normalized = (dataY - yMin) / (yMax - yMin);
      // Инвертируем Y для SVG координат (0 вверху)
      return padding.top + (1 - normalized) * plotHeight;
    };

    // Обратные функции для конвертации экранных координат в данные
    const xScaleInvert = (screenX: number) => {
      const normalized = (screenX - padding.left) / plotWidth;
      return xMin + normalized * (xMax - xMin);
    };

    const yScaleInvert = (screenY: number) => {
      const normalized = (screenY - padding.top) / plotHeight;
      return yMin + (1 - normalized) * (yMax - yMin);
    };

    return {
      xScale,
      yScale,
      xScaleInvert,
      yScaleInvert,
      plotWidth,
      plotHeight,
    };
  }, [dataExtent]);

  // Преобразование данных файлов в точки для отображения
  const points: Point[] = useMemo(() => {
    const allPoints: Point[] = [];

    state.files.forEach(file => {
      if (file.gasolineVisible && file.data.gasoline) {
        file.data.gasoline.forEach((point: MapPoint) => {
          allPoints.push({
            x: point.x,
            y: point.y,
            fileId: file.id,
            fileName: file.name,
            type: 'gasoline',
            visible: file.visible,
            isActive: state.activeFile === file.id,
          });
        });
      }

      if (file.gasVisible && file.data.gas) {
        file.data.gas.forEach((point: MapPoint) => {
          allPoints.push({
            x: point.x,
            y: point.y,
            fileId: file.id,
            fileName: file.name,
            type: 'gas',
            visible: file.visible,
            isActive: state.activeFile === file.id,
          });
        });
      }
    });

    return allPoints;
  }, [state.files, state.activeFile]);

  // Вычисление границ данных
  useEffect(() => {
    if (points.length === 0) {
      setDataExtent({ xMin: 0, xMax: 100, yMin: 0, yMax: 100 });
      return;
    }

    const visiblePoints = points.filter(p => p.visible);
    if (visiblePoints.length === 0) {
      setDataExtent({ xMin: 0, xMax: 100, yMin: 0, yMax: 100 });
      return;
    }

    const xValues = visiblePoints.map(p => p.x);
    const yValues = visiblePoints.map(p => p.y);

    const dataMinX = Math.min(...xValues);
    const dataMaxX = Math.max(...xValues);
    const dataMinY = Math.min(...yValues);
    const dataMaxY = Math.max(...yValues);

    // Добавляем небольшие отступы к данным (5%)
    const xRange = dataMaxX - dataMinX || 1;
    const yRange = dataMaxY - dataMinY || 1;
    const xPadding = xRange * 0.05;
    const yPadding = yRange * 0.05;

    setDataExtent({
      xMin: dataMinX - xPadding,
      xMax: dataMaxX + xPadding,
      yMin: dataMinY - yPadding,
      yMax: dataMaxY + yPadding,
    });
  }, [points]);

  // Создание линий сетки с использованием scales
  const gridLines = useMemo(() => {
    const lines = [];
    const { xMin, xMax, yMin, yMax } = dataExtent;
    const { xScale, yScale } = scales;
    const { padding } = SVG_DIMENSIONS;

    // Определяем шаг сетки
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const getOptimalStep = (range: number) => {
      const targetLines = 8;
      const rawStep = range / targetLines;
      const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
      const normalized = rawStep / magnitude;

      if (normalized <= 1) return magnitude;
      if (normalized <= 2) return 2 * magnitude;
      if (normalized <= 5) return 5 * magnitude;
      return 10 * magnitude;
    };

    const xStep = getOptimalStep(xRange);
    const yStep = getOptimalStep(yRange);

    // Вертикальные линии
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const screenX = xScale(x);
      if (
        screenX >= padding.left &&
        screenX <= SVG_DIMENSIONS.width - padding.right
      ) {
        lines.push(
          <line
            key={`v-${x}`}
            x1={screenX}
            y1={padding.top}
            x2={screenX}
            y2={SVG_DIMENSIONS.height - padding.bottom}
            stroke={config.colors.grid}
            strokeWidth="0.5"
            opacity="0.7"
          />
        );
      }
    }

    // Горизонтальные линии
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const screenY = yScale(y);
      if (
        screenY >= padding.top &&
        screenY <= SVG_DIMENSIONS.height - padding.bottom
      ) {
        lines.push(
          <line
            key={`h-${y}`}
            x1={padding.left}
            y1={screenY}
            x2={SVG_DIMENSIONS.width - padding.right}
            y2={screenY}
            stroke={config.colors.grid}
            strokeWidth="0.5"
            opacity="0.7"
          />
        );
      }
    }

    return lines;
  }, [dataExtent, scales, config.colors.grid]);

  // Создание осей координат с использованием scales
  const axes = useMemo(() => {
    const { padding } = SVG_DIMENSIONS;

    return (
      <>
        {/* Ось X (внизу) */}
        <line
          x1={padding.left}
          y1={SVG_DIMENSIONS.height - padding.bottom}
          x2={SVG_DIMENSIONS.width - padding.right}
          y2={SVG_DIMENSIONS.height - padding.bottom}
          stroke={config.colors.axis}
          strokeWidth="2"
        />

        {/* Ось Y (слева) */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={SVG_DIMENSIONS.height - padding.bottom}
          stroke={config.colors.axis}
          strokeWidth="2"
        />
      </>
    );
  }, [config.colors.axis]);

  // Создание подписей на осях с использованием scales
  const axisLabels = useMemo(() => {
    const { xMin, xMax, yMin, yMax } = dataExtent;
    const { xScale, yScale } = scales;
    const { padding } = SVG_DIMENSIONS;
    const labels = [];

    // Определяем шаг для подписей (меньше чем для сетки)
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    const getOptimalStep = (range: number) => {
      const targetSteps = 6;
      const rawStep = range / targetSteps;
      const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
      const normalized = rawStep / magnitude;

      if (normalized <= 1) return magnitude;
      if (normalized <= 2) return 2 * magnitude;
      if (normalized <= 5) return 5 * magnitude;
      return 10 * magnitude;
    };

    const xStep = getOptimalStep(xRange);
    const yStep = getOptimalStep(yRange);

    // Функция форматирования чисел
    const formatNumber = (value: number, step: number) => {
      let decimals = 0;
      if (step < 1) {
        decimals = Math.ceil(-Math.log10(step));
      } else if (step >= 1 && step < 10) {
        decimals = step % 1 === 0 ? 0 : 1;
      }
      return value.toFixed(decimals);
    };

    // Подписи оси X
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const screenX = xScale(x);
      if (
        screenX >= padding.left &&
        screenX <= SVG_DIMENSIONS.width - padding.right
      ) {
        labels.push(
          <g key={`x-label-${x}`}>
            {/* Засечка */}
            <line
              x1={screenX}
              y1={SVG_DIMENSIONS.height - padding.bottom}
              x2={screenX}
              y2={SVG_DIMENSIONS.height - padding.bottom + 6}
              stroke={config.colors.axis}
              strokeWidth="1"
            />
            {/* Подпись */}
            <text
              x={screenX}
              y={SVG_DIMENSIONS.height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="12"
              fill={config.colors.text}
            >
              {formatNumber(x, xStep)}
            </text>
          </g>
        );
      }
    }

    // Подписи оси Y
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const screenY = yScale(y);
      if (
        screenY >= padding.top &&
        screenY <= SVG_DIMENSIONS.height - padding.bottom
      ) {
        labels.push(
          <g key={`y-label-${y}`}>
            {/* Засечка */}
            <line
              x1={padding.left - 6}
              y1={screenY}
              x2={padding.left}
              y2={screenY}
              stroke={config.colors.axis}
              strokeWidth="1"
            />
            {/* Подпись */}
            <text
              x={padding.left - 10}
              y={screenY}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="12"
              fill={config.colors.text}
            >
              {formatNumber(y, yStep)}
            </text>
          </g>
        );
      }
    }

    return labels;
  }, [dataExtent, scales, config.colors.axis, config.colors.text]);

  /**
   * Обработка наведения на точку
   */
  const handlePointHover = useCallback((point: Point | null) => {
    if (point) {
      setHoveredPoint({
        x: point.x,
        y: point.y,
        file: point.fileName,
        type: point.type,
      });
    } else {
      setHoveredPoint(null);
    }
  }, []);

  /**
   * Обработка клика по точке
   */
  const handlePointClick = useCallback((point: Point) => {
    console.log('Клик по точке:', {
      coordinates: { x: point.x, y: point.y },
      file: point.fileName,
      type: point.type,
    });
  }, []);

  return (
    <div className={`relative flex  ${className}`}>
      {/* SVG область */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_DIMENSIONS.width} ${SVG_DIMENSIONS.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="cursor-crosshair"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Фон */}
        <rect
          x={0}
          y={0}
          width={SVG_DIMENSIONS.width}
          height={SVG_DIMENSIONS.height}
          fill="white"
        />

        {/* Сетка */}
        <g>{gridLines}</g>

        {/* Оси */}
        <g>{axes}</g>

        {/* Подписи на осях */}
        <g>{axisLabels}</g>

        {/* Точки данных */}
        <g>
          {points
            .filter(point => point.visible)
            .map((point, index) => {
              const size = point.isActive
                ? config.pointRadius * 1.5
                : config.pointRadius;
              return (
                <rect
                  key={`${point.fileId}-${point.type}-${index}`}
                  x={scales.xScale(point.x) - size}
                  y={scales.yScale(point.y) - size}
                  width={size * 2}
                  height={size * 2}
                  fill={
                    point.type === 'gasoline'
                      ? config.colors.gasoline
                      : config.colors.gas
                  }
                  stroke={
                    point.isActive ? config.colors.activePoint : '#000000'
                  }
                  strokeWidth={point.isActive ? 2 : 1}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={() => handlePointHover(point)}
                  onMouseLeave={() => handlePointHover(null)}
                  onClick={() => handlePointClick(point)}
                />
              );
            })}
        </g>

        {/* Названия осей */}
        <text
          x={SVG_DIMENSIONS.width / 2}
          y={SVG_DIMENSIONS.height - SVG_DIMENSIONS.padding.bottom + 45}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={config.colors.text}
        >
          Давление (мбар)
        </text>
        <text
          x={25}
          y={SVG_DIMENSIONS.height / 2}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill={config.colors.text}
          transform={`rotate(-90, 25, ${SVG_DIMENSIONS.height / 2})`}
        >
          Время впрыска (мс)
        </text>
      </svg>

      {/* Информация о точке при наведении */}
      {hoveredPoint && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs z-10">
          <div>Файл: {hoveredPoint.file}</div>
          <div>Тип: {hoveredPoint.type === 'gasoline' ? 'Бензин' : 'Газ'}</div>
          <div>Давление: {hoveredPoint.x.toFixed(1)} мбар</div>
          <div>Время впрыска: {hoveredPoint.y.toFixed(1)} мс</div>
        </div>
      )}

      {/* Легенда */}
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
  );
}
