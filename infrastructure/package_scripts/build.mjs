import fs from 'node:fs';
import { spawnPromise } from './utilities/spawn_promise.mjs';

const tscConfigs = [
  './infrastructure/typescript/tsconfig.cjs.json',
  './infrastructure/typescript/tsconfig.esm.json',
  './infrastructure/typescript/tsconfig.types.json'
];

await spawnPromise(`npx tsc -b ${tscConfigs.join(' ')}`, {
  outputPrefix: '[build]: '
});

// Rename file so it's correctly handled as an ESModule
fs.rename('dist/esm/instantiator.js', 'dist/esm/instantiator.mjs', (err) => {
  if (err) {
    console.error(err);
  }
});
