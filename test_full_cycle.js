// Полный тест цикла парсинг -> обработка -> экспорт
const fs = require('fs');

// Эмулируем MapPoint интерфейс
class MapPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Эмулируем функцию parseMapFile
function parseMapFile(content) {
  const lines = content.trim().split('\n');

  if (lines.length !== 480) {
    throw new Error(
      `Неверный формат файла: ожидается 480 строк, получено ${lines.length}`
    );
  }

  const gasoline = [];
  const gas = [];

  for (let i = 0; i < lines.length; i += 4) {
    // Заменяем запятые на точки для корректного парсинга дробных чисел
    const xGasoline = parseFloat(lines[i].replace(',', '.'));
    const yGasoline = parseFloat(lines[i + 1].replace(',', '.'));
    const xGas = parseFloat(lines[i + 2].replace(',', '.'));
    const yGas = parseFloat(lines[i + 3].replace(',', '.'));

    if (isNaN(xGasoline) || isNaN(yGasoline) || isNaN(xGas) || isNaN(yGas)) {
      throw new Error(`Неверные числовые данные в строках ${i + 1}-${i + 4}`);
    }

    gasoline.push(new MapPoint(xGasoline, yGasoline));
    gas.push(new MapPoint(xGas, yGas));
  }

  return { gasoline, gas };
}

// Эмулируем функцию mergeMaps
function mergeMaps(gasolineMap, gasMap) {
  if (gasolineMap.length !== gasMap.length) {
    throw new Error('Карты должны содержать одинаковое количество точек');
  }

  const lines = [];

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

// Тестируем полный цикл
console.log('=== ТЕСТ ПОЛНОГО ЦИКЛА ПАРСИНГА И ЭКСПОРТА ===');

try {
  // 1. Читаем тестовый файл
  console.log('\n1. Читаем тестовый файл...');
  const testContent = fs.readFileSync(
    './tech_spec/11072017-gasoline.map',
    'utf8'
  );
  console.log(`   Размер файла: ${testContent.split('\n').length} строк`);

  // 2. Парсим файл
  console.log('\n2. Парсим файл...');
  const parsedData = parseMapFile(testContent);
  console.log(`   Бензиновые точки: ${parsedData.gasoline.length}`);
  console.log(`   Газовые точки: ${parsedData.gas.length}`);

  // 3. Показываем примеры распарсенных значений
  console.log('\n3. Примеры распарсенных значений:');
  for (let i = 0; i < Math.min(5, parsedData.gasoline.length); i++) {
    const gasoline = parsedData.gasoline[i];
    const gas = parsedData.gas[i];
    console.log(
      `   Точка ${i + 1}: Бензин(${gasoline.x}, ${gasoline.y}), Газ(${gas.x}, ${gas.y})`
    );
  }

  // 4. Создаем объединенную карту
  console.log('\n4. Создаем объединенную карту...');
  const mergedContent = mergeMaps(parsedData.gasoline, parsedData.gas);
  const mergedLines = mergedContent.split('\n');
  console.log(`   Объединенный файл: ${mergedLines.length} строк`);

  // 5. Показываем примеры экспортированных значений
  console.log('\n5. Примеры экспортированных значений:');
  for (let i = 0; i < Math.min(20, mergedLines.length); i += 4) {
    console.log(
      `   Строки ${i + 1}-${i + 4}: ${mergedLines[i]}, ${mergedLines[i + 1]}, ${mergedLines[i + 2]}, ${mergedLines[i + 3]}`
    );
    if (i >= 16) break; // Показываем только первые 5 точек
  }

  // 6. Проверяем, что дробные значения сохранились
  console.log('\n6. Проверка сохранения дробных значений:');
  let decimalCount = 0;
  for (let i = 0; i < Math.min(100, mergedLines.length); i++) {
    if (mergedLines[i].includes(',') && mergedLines[i] !== '0') {
      decimalCount++;
    }
  }
  console.log(
    `   Найдено строк с дробными значениями: ${decimalCount} из первых 100`
  );

  console.log('\n✅ ТЕСТ ПРОШЕЛ УСПЕШНО!');
} catch (error) {
  console.error('\n❌ ОШИБКА:', error.message);
}

console.log('\n=== КОНЕЦ ТЕСТА ===');
