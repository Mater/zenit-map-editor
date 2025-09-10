import { MapPoint, MapFile } from '../types';

export interface CanvasConfig {
  width: number;
  height: number;
  padding: number;
  gridSize: number;
  pointRadius: number;
  colors: {
    gasoline: string;
    gas: string;
    grid: string;
    axis: string;
    text: string;
  };
}

export interface Viewport {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

export class MapService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private config: CanvasConfig;
  private viewport: Viewport;

  constructor(canvas: HTMLCanvasElement, config?: Partial<CanvasConfig>) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    if (!this.ctx) {
      throw new Error('Не удалось получить контекст Canvas');
    }

    // Конфигурация по умолчанию
    this.config = {
      width: canvas.width,
      height: canvas.height,
      padding: 40,
      gridSize: 20,
      pointRadius: 3,
      colors: {
        gasoline: '#3B82F6', // синий
        gas: '#F59E0B', // желтый
        grid: '#E5E7EB', // серый
        axis: '#374151', // темно-серый
        text: '#111827', // черный
      },
      ...config,
    };

    this.viewport = {
      minX: 0,
      maxX: 1000,
      minY: 0,
      maxY: 1000,
      scaleX: 1,
      scaleY: 1,
      offsetX: 0,
      offsetY: 0,
    };

    this.setupCanvas();
  }

  /**
   * Настройка Canvas
   */
  private setupCanvas(): void {
    if (!this.canvas || !this.ctx) return;

    // Устанавливаем размеры
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;

    // Настраиваем контекст
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
  }

  /**
   * Обновление viewport на основе данных карт
   */
  updateViewport(files: MapFile[]): void {
    // Устанавливаем фиксированные границы с minX и minY = 0
    let maxX = 0;
    let maxY = 0;

    // Находим максимальные значения из данных
    if (files.length > 0) {
      files.forEach(file => {
        if (!file.visible) return;

        if (file.gasolineVisible && file.data.gasoline.length > 0) {
          file.data.gasoline.forEach(point => {
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
          });
        }

        if (file.gasVisible && file.data.gas.length > 0) {
          file.data.gas.forEach(point => {
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
          });
        }
      });
    }

    if (maxX === 0 && maxY === 0) {
      maxX = 1000;
      maxY = 50;
    }

    // Устанавливаем viewport с minX = 0 и minY = 0
    this.viewport.minX = 0;
    this.viewport.maxX = maxX;
    this.viewport.minY = 0;
    this.viewport.maxY = maxY;

    // Вычисляем масштаб
    const availableWidth = this.config.width - 2 * this.config.padding;
    const availableHeight = this.config.height - 2 * this.config.padding;

    this.viewport.scaleX =
      availableWidth / (this.viewport.maxX - this.viewport.minX);
    this.viewport.scaleY =
      availableHeight / (this.viewport.maxY - this.viewport.minY);
    this.viewport.offsetX = this.config.padding;
    this.viewport.offsetY = this.config.padding;
  }

  /**
   * Преобразование координат из логических в экранные
   */
  private worldToScreen(x: number, y: number): { x: number; y: number } {
    const screenX =
      this.viewport.offsetX + (x - this.viewport.minX) * this.viewport.scaleX;
    const screenY =
      this.viewport.offsetY + (this.viewport.maxY - y) * this.viewport.scaleY;
    return { x: screenX, y: screenY };
  }

  /**
   * Преобразование координат из экранных в логические
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const x =
      this.viewport.minX +
      (screenX - this.viewport.offsetX) / this.viewport.scaleX;
    const y =
      this.viewport.maxY -
      (screenY - this.viewport.offsetY) / this.viewport.scaleY;
    return { x, y };
  }

  /**
   * Очистка Canvas
   */
  clear(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
  }

  /**
   * Отрисовка сетки
   */
  private drawGrid(): void {
    if (!this.ctx) return;

    this.ctx.strokeStyle = this.config.colors.grid;
    this.ctx.lineWidth = 1;

    // Вертикальные линии
    const stepX = (this.viewport.maxX - this.viewport.minX) / 10;
    for (let i = 0; i <= 10; i++) {
      const x = this.viewport.minX + i * stepX;
      const screenPos = this.worldToScreen(x, this.viewport.minY);
      const endPos = this.worldToScreen(x, this.viewport.maxY);

      this.ctx.beginPath();
      this.ctx.moveTo(screenPos.x, screenPos.y);
      this.ctx.lineTo(endPos.x, endPos.y);
      this.ctx.stroke();
    }

    // Горизонтальные линии
    const stepY = (this.viewport.maxY - this.viewport.minY) / 10;
    for (let i = 0; i <= 10; i++) {
      const y = this.viewport.minY + i * stepY;
      const screenPos = this.worldToScreen(this.viewport.minX, y);
      const endPos = this.worldToScreen(this.viewport.maxX, y);

      this.ctx.beginPath();
      this.ctx.moveTo(screenPos.x, screenPos.y);
      this.ctx.lineTo(endPos.x, endPos.y);
      this.ctx.stroke();
    }
  }

  /**
   * Отрисовка осей
   */
  private drawAxes(): void {
    if (!this.ctx) return;

    this.ctx.strokeStyle = this.config.colors.axis;
    this.ctx.lineWidth = 2;

    // Ось X
    const xAxisStart = this.worldToScreen(this.viewport.minX, 0);
    const xAxisEnd = this.worldToScreen(this.viewport.maxX, 0);
    this.ctx.beginPath();
    this.ctx.moveTo(xAxisStart.x, xAxisStart.y);
    this.ctx.lineTo(xAxisEnd.x, xAxisEnd.y);
    this.ctx.stroke();

    // Ось Y
    const yAxisStart = this.worldToScreen(0, this.viewport.minY);
    const yAxisEnd = this.worldToScreen(0, this.viewport.maxY);
    this.ctx.beginPath();
    this.ctx.moveTo(yAxisStart.x, yAxisStart.y);
    this.ctx.lineTo(yAxisEnd.x, yAxisEnd.y);
    this.ctx.stroke();
  }

  /**
   * Отрисовка точек карты
   */
  private drawMapPoints(
    points: MapPoint[],
    color: string,
    opacity: number = 1,
    isActive: boolean = false
  ): void {
    if (!this.ctx || points.length === 0) return;

    this.ctx.globalAlpha = opacity;

    points.forEach(point => {
      const screenPos = this.worldToScreen(point.x, point.y);
      const size = this.config.pointRadius * 2;
      const halfSize = this.config.pointRadius;

      // Рисуем квадрат с заливкой
      this.ctx!.fillStyle = color;
      this.ctx!.fillRect(
        screenPos.x - halfSize,
        screenPos.y - halfSize,
        size,
        size
      );

      // Рисуем бордер - более толстый для активного файла
      this.ctx!.strokeStyle = isActive ? '#FF0000' : '#000000';
      this.ctx!.lineWidth = isActive ? 3 : 1;
      this.ctx!.strokeRect(
        screenPos.x - halfSize,
        screenPos.y - halfSize,
        size,
        size
      );

      // Добавляем дополнительную подсветку для активного файла
      if (isActive) {
        this.ctx!.strokeStyle = '#FF0000';
        this.ctx!.lineWidth = 1;
        this.ctx!.globalAlpha = 0.5;
        this.ctx!.strokeRect(
          screenPos.x - halfSize - 2,
          screenPos.y - halfSize - 2,
          size + 4,
          size + 4
        );
        this.ctx!.globalAlpha = opacity;
      }
    });

    this.ctx.globalAlpha = 1;
  }

  /**
   * Отрисовка подписей осей
   */
  private drawLabels(): void {
    if (!this.ctx) return;

    this.ctx.fillStyle = this.config.colors.text;
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Подпись оси X - размещаем внизу по центру
    const xLabelX = this.config.width / 2;
    const xLabelY = this.config.height - 10;
    this.ctx.fillText('Давление (мбар)', xLabelX, xLabelY);

    // Подпись оси Y - размещаем слева по центру, повернута на 90 градусов
    const yLabelX = 20;
    const yLabelY = this.config.height / 2;
    this.ctx.save();
    this.ctx.translate(yLabelX, yLabelY);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText('Время впрыска (мс)', 0, 0);
    this.ctx.restore();
  }

  /**
   * Отрисовка значений на осях
   */
  private drawAxisValues(): void {
    if (!this.ctx) return;

    this.ctx.fillStyle = this.config.colors.text;
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';

    // Значения на оси X
    const xStep = (this.viewport.maxX - this.viewport.minX) / 10;
    for (let i = 0; i <= 10; i++) {
      const x = this.viewport.minX + i * xStep;
      const screenPos = this.worldToScreen(x, this.viewport.minY);

      this.ctx.fillText(x.toFixed(0), screenPos.x, screenPos.y + 5);
    }

    // Значения на оси Y
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    const yStep = (this.viewport.maxY - this.viewport.minY) / 10;
    for (let i = 0; i <= 10; i++) {
      const y = this.viewport.minY + i * yStep;
      const screenPos = this.worldToScreen(this.viewport.minX, y);

      this.ctx.fillText(y.toFixed(0), screenPos.x - 5, screenPos.y);
    }

    // Сбрасываем настройки текста
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
  }

  /**
   * Отрисовка всех карт
   */
  render(files: MapFile[], activeFileId?: string | null): void {
    if (!this.ctx) return;

    this.clear();
    this.updateViewport(files);

    // Всегда рисуем сетку и оси
    this.drawGrid();
    this.drawAxes();
    this.drawLabels();
    this.drawAxisValues();

    // Отрисовка карт
    files.forEach(file => {
      if (!file.visible) return;

      const opacity = file.visible ? 1 : 0.5;
      const isActive = activeFileId === file.id;

      if (file.gasolineVisible && file.data.gasoline.length > 0) {
        this.drawMapPoints(
          file.data.gasoline,
          this.config.colors.gasoline,
          opacity,
          isActive
        );
      }

      if (file.gasVisible && file.data.gas.length > 0) {
        this.drawMapPoints(
          file.data.gas,
          this.config.colors.gas,
          opacity,
          isActive
        );
      }
    });
  }

  /**
   * Получение точки под курсором
   */
  getPointAt(
    screenX: number,
    screenY: number,
    files: MapFile[]
  ): {
    file: MapFile;
    point: MapPoint;
    type: 'gasoline' | 'gas';
  } | null {
    const worldPos = this.screenToWorld(screenX, screenY);
    const threshold = 10 / Math.min(this.viewport.scaleX, this.viewport.scaleY);

    for (const file of files) {
      if (!file.visible) continue;

      if (file.gasolineVisible) {
        for (const point of file.data.gasoline) {
          const distance = Math.sqrt(
            Math.pow(point.x - worldPos.x, 2) +
              Math.pow(point.y - worldPos.y, 2)
          );
          if (distance < threshold) {
            return { file, point, type: 'gasoline' };
          }
        }
      }

      if (file.gasVisible) {
        for (const point of file.data.gas) {
          const distance = Math.sqrt(
            Math.pow(point.x - worldPos.x, 2) +
              Math.pow(point.y - worldPos.y, 2)
          );
          if (distance < threshold) {
            return { file, point, type: 'gas' };
          }
        }
      }
    }

    return null;
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newConfig: Partial<CanvasConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setupCanvas();
  }

  /**
   * Получение текущей конфигурации
   */
  getConfig(): CanvasConfig {
    return { ...this.config };
  }
}
