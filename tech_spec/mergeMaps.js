const fs = require('fs');

const petrolMapPath = process.argv[2];
const gasMapPath = process.argv[3];

const petrolMap = fs.readFileSync(petrolMapPath).toString().split('\r\n');
const gasMap = fs.readFileSync(gasMapPath).toString().split('\r\n');

const mergedMap = [];
for (let i = 0; i < 120; i++) {
  const offset = i * 4;
  mergedMap.push(petrolMap[offset]);
  mergedMap.push(petrolMap[offset + 1]);
  mergedMap.push(gasMap[offset + 2]);
  mergedMap.push(gasMap[offset + 3]);
}

const data = mergedMap.join('\r\n');
fs.writeFileSync(
  `${gasMapPath.substring(0, gasMapPath.length - 4)}M.map`,
  data
);

console.log('maps merged', data);
