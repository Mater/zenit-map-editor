# Zenit Map Editor

Desktop приложение для редактирования топливных карт газобаллонного оборудования Zenit JZ 2009.

## Технологический стек

- **Electron** - Desktop приложение
- **React 18** - UI библиотека
- **TypeScript** - Статическая типизация
- **Tailwind CSS** - Utility-first CSS
- **Zustand** - Управление состоянием
- **Webpack** - Сборка приложения

## Установка

1. Клонируйте репозиторий:

```bash
git clone <repository-url>
cd zenit-map-editor
```

2. Установите зависимости:

```bash
npm install
```

## Разработка

### Запуск в режиме разработки:

```bash
npm run dev
```

### Сборка:

```bash
npm run build
```

### Запуск приложения:

```bash
npm start
```

### Создание дистрибутива:

```bash
npm run dist
```

## Структура проекта

```
src/
├── main/                # Electron главный процесс
│   ├── main.ts         # Точка входа главного процесса
│   └── preload.ts      # Preload скрипт
├── renderer/            # React приложение
│   ├── components/      # React компоненты
│   ├── store/          # Zustand store
│   ├── App.tsx         # Главный компонент
│   └── index.tsx       # Точка входа React
└── shared/              # Общий код
    ├── types.ts        # TypeScript типы
    └── utils.ts        # Утилиты
```

## Функциональность

- Загрузка и валидация .map файлов
- Визуализация топливных карт
- Управление видимостью файлов и карт
- Объединение бензиновых и газовых карт
- Сохранение объединенных файлов

## Лицензия

MIT
