import { parseMapFile } from '../map';
import testMap from './testMap.map';

describe('Map service', () => {
  describe('Parse file', () => {
    it('should parse file without errors', () => {
      parseMapFile(testMap);
    });

    it('should parse file and return map', () => {
      const map = parseMapFile(testMap);

      expect(typeof map).toBe('object');
      expect(map).toHaveProperty('gasoline');
      expect(map).toHaveProperty('gas');
      expect(Array.isArray(map.gasoline)).toBeTruthy();
      expect(Array.isArray(map.gas)).toBeTruthy();
    });
  });
});
