import { MapFile, FuelMap, MapPoint } from '../types';

export class FileService {
  /**
   * Парсинг .map файла
   * @param content - содержимое файла
   * @returns объект FuelMap с бензиновыми и газовыми картами
   */
  static parseMapFile(content: string): FuelMap {
    const lines = content.trim().split('\n');

    // Проверяем, что файл содержит 480 строк (120 точек × 4 значения)
    if (lines.length !== 480) {
      throw new Error(
        `Неверный формат файла: ожидается 480 строк, получено ${lines.length}`
      );
    }

    const gasoline: MapPoint[] = [];
    const gas: MapPoint[] = [];

    // Парсим каждые 4 строки как одну точку
    for (let i = 0; i < lines.length; i += 4) {
      try {
        // X_бензин, Y_бензин, X_газ, Y_газ
        // Заменяем запятые на точки для корректного парсинга дробных чисел
        const xGasoline = parseFloat(lines[i].replace(',', '.'));
        const yGasoline = parseFloat(lines[i + 1].replace(',', '.'));
        const xGas = parseFloat(lines[i + 2].replace(',', '.'));
        const yGas = parseFloat(lines[i + 3].replace(',', '.'));

        // Валидация числовых значений
        if (
          isNaN(xGasoline) ||
          isNaN(yGasoline) ||
          isNaN(xGas) ||
          isNaN(yGas)
        ) {
          throw new Error(
            `Неверные числовые данные в строках ${i + 1}-${i + 4}`
          );
        }

        gasoline.push({ x: xGasoline, y: yGasoline });
        gas.push({ x: xGas, y: yGas });
      } catch (error) {
        throw new Error(
          `Ошибка парсинга строк ${i + 1}-${i + 4}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        );
      }
    }

    return { gasoline, gas };
  }

  /**
   * Создание MapFile из File объекта
   * @param file - File объект
   * @param id - уникальный идентификатор
   * @returns Promise<MapFile>
   */
  static async createMapFile(file: File, id: string): Promise<MapFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        try {
          const content = event.target?.result as string;
          const data = this.parseMapFile(content);

          const mapFile: MapFile = {
            id,
            name: file.name,
            path: file.path || '',
            data,
            visible: true,
            gasolineVisible: true,
            gasVisible: true,
          };

          resolve(mapFile);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Объединение бензиновой и газовой карт
   * @param gasolineMap - бензиновая карта
   * @param gasMap - газовая карта
   * @returns объединенная карта в формате .map файла
   */
  static mergeMaps(gasolineMap: MapPoint[], gasMap: MapPoint[]): string {
    if (gasolineMap.length !== gasMap.length) {
      throw new Error('Карты должны содержать одинаковое количество точек');
    }

    const lines: string[] = [];

    for (let i = 0; i < gasolineMap.length; i++) {
      const gasPoint = gasolineMap[i];
      const gasPoint2 = gasMap[i];

      lines.push(
        gasPoint.x.toString().replace('.', ','),
        gasPoint.y.toString().replace('.', ','),
        gasPoint2.x.toString().replace('.', ','),
        gasPoint2.y.toString().replace('.', ',')
      );
    }

    return lines.join('\n');
  }

  /**
   * Создание объединенного файла
   * @param gasolineFile - файл с бензиновой картой
   * @param gasFile - файл с газовой картой
   * @param filename - имя результирующего файла
   * @returns содержимое объединенного файла
   */
  static createMergedFile(gasolineFile: MapFile, gasFile: MapFile): string {
    return this.mergeMaps(gasolineFile.data.gasoline, gasFile.data.gas);
  }
}
