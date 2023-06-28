import { spawnPromise } from './utilities/spawn_promise.mjs';

await import('./build.mjs');

await spawnPromise('npx mocha tests/tests.js', {
  outputPrefix: '[test]: '
});
