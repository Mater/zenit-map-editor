import fs from 'fs';
import { parseMapFile } from './map';

/**
 * Reads data from file
 * @param {String} filePath - File name
 * @returns {Promise.<String>} file content
 */
export function readFile(filePath) {
  return new Promise((resolve, reject) => () => {
    fs.readFile(filePath, (error, fileContent) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(fileContent);
    });
  });
}

/**
 * Reads data from file
 * @param {String} filePath - File name
 * @returns {Promise.<Object>} map
 */
export async function readMapFile(filePath) {
  const fileContent = await readFile(filePath);
  const fuelMap = parseMapFile(fileContent);

  return fuelMap;
}
