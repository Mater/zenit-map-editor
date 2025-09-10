/**
 * Проверяет, запущено ли приложение в режиме разработки
 */
export function isDev(): boolean {
  return (
    typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
  );
}

/**
 * Проверяет, является ли файл валидным .map файлом
 */
export function isValidMapFile(filePath: string): boolean {
  return filePath.toLowerCase().endsWith('.map');
}

/**
 * Извлекает имя файла из пути
 */
export function getFileName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() || '';
}

/**
 * Форматирует размер файла в читаемый вид
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
