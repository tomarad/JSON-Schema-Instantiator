import { spawnPromise } from './utilities/spawn_promise.mjs';

await spawnPromise('rm -rf dist', {
  outputPrefix: '[clean]: '
});
