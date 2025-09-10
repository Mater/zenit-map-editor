import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

const MapViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { files } = useAppStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Установка размера canvas
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисование координатной сетки
    drawGrid(ctx, canvas.width, canvas.height);

    // Рисование топливных точек
    drawFuelPoints(ctx, canvas.width, canvas.height);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [files]);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Вертикальные линии
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Горизонтальные линии
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawFuelPoints = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // TODO: Реализовать рисование топливных точек на основе данных из files
    // Пока что рисуем тестовые точки
    const testPoints = [
      { x: 100, y: 100, type: 'gasoline' as const },
      { x: 200, y: 150, type: 'gas' as const },
      { x: 300, y: 200, type: 'gasoline' as const },
    ];

    testPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = point.type === 'gasoline' ? '#3b82f6' : '#facc15';
      ctx.fill();
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="flex-1 canvas-container">
        <canvas
          ref={canvasRef}
          className="w-full h-full border border-gray-300 rounded-lg bg-white"
        />
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          <span className="font-medium">X:</span> Давление (мбар)
        </div>
        <div>
          <span className="font-medium">Y:</span> Время впрыска (мс)
        </div>
      </div>

      <div className="mt-2 flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
          <span>Бензин</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gas-500 rounded-full"></div>
          <span>Газ</span>
        </div>
      </div>
    </div>
  );
};

export default MapViewer;
