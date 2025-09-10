import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

const ControlPanel: React.FC = () => {
  const {
    files,
    selectedGasolineMap,
    selectedGasMap,
    selectGasolineMap,
    selectGasMap,
  } = useAppStore();

  const [fileName, setFileName] = useState('merged_map.map');

  const handleSave = async () => {
    if (!selectedGasolineMap || !selectedGasMap) {
      alert('Выберите бензиновую и газовую карты для объединения');
      return;
    }

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.saveFile({
          defaultPath: fileName,
        });

        if (!result.canceled && result.filePath) {
          // TODO: Реализовать объединение карт и сохранение
          console.log('Saving to:', result.filePath);
          console.log('Gasoline map:', selectedGasolineMap);
          console.log('Gas map:', selectedGasMap);
        }
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const visibleFiles = files.filter(file => file.isVisible);

  return (
    <div className="p-4 flex-1">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Объединение карт
      </h2>

      <div className="space-y-4">
        {/* Выбор бензиновой карты */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Бензиновая карта:
          </label>
          <div className="space-y-2">
            {visibleFiles.map(file => (
              <label
                key={file.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="gasolineMap"
                  value={file.id}
                  checked={selectedGasolineMap === file.id}
                  onChange={() => selectGasolineMap(file.id)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{file.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Выбор газовой карты */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Газовая карта:
          </label>
          <div className="space-y-2">
            {visibleFiles.map(file => (
              <label
                key={file.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="gasMap"
                  value={file.id}
                  checked={selectedGasMap === file.id}
                  onChange={() => selectGasMap(file.id)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{file.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Имя файла */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Имя файла:
          </label>
          <input
            type="text"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            className="input-field"
            placeholder="merged_map.map"
          />
        </div>

        {/* Кнопка сохранения */}
        <button
          onClick={handleSave}
          disabled={!selectedGasolineMap || !selectedGasMap}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Сохранить объединенную карту
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
