/**
 * Empty map
 * @type {Object}
 * @constant
 */
const EMPTY_MAP = {
  gasoline: [],
  gas: []
};

/**
 * Parse file content and create map object
 * @param {String} fileContent - File content
 * @returns {Object} fuel map
 */
export function parseMapFile(fileContent) {
  if (!fileContent) {
    return EMPTY_MAP;
  }

  const numberFormatString = fileContent.replace(/,/g, '.');
  const commaString = numberFormatString.replace(/\s{4}/g, ', ');
  const arrayString = `[${commaString}]`;
  const mixedArray = JSON.parse(arrayString);
  const fileLength = Math.floor(mixedArray.length / 4);

  const gasoline = [];
  const gas = [];

  for (let i = 0; i < fileLength; i += 1) {
    const airPressureGasoline = mixedArray[i];
    const gasolineInjection = mixedArray[i + 1];
    const airPressureGas = mixedArray[i + 2];
    const gasInjection = mixedArray[i + 1];

    if (airPressureGasoline) {
      gasoline.push({
        pressure: airPressureGasoline,
        injection: gasolineInjection
      });
    }

    if (airPressureGas) {
      gas.push({
        pressure: airPressureGas,
        injection: gasInjection
      });
    }
  }

  return {
    gasoline,
    gas
  };
}
