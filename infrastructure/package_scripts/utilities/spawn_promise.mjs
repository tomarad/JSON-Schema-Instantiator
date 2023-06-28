import { spawn } from 'child_process';

/**
 * @param {number} startTime
 */
function printDuration(startTime) {
  const elapsedMs = performance.now() - startTime;
  if (elapsedMs < 60_000) {
    return `${(elapsedMs / 1_000).toFixed(2)}s`;
  }
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = ((elapsedMs % 60000) / 1000).toFixed(0);
  return seconds === '60' ? `${minutes + 1}m:00s` : `${minutes}m:${(Number(seconds) < 10 ? '0' : '') + seconds}s`;
}

/**
 * @param {string} command
 * @param {import('child_process').SpawnOptionsWithoutStdio & {
 *  silent?: boolean,
 *  outputPrefix?: string,
 *  forwardParams?: boolean
 * }} [options]
 */
export const spawnPromise = (command, options) =>
  new Promise((resolve, reject) => {
    /** @type {string} */
    let cmd;
    if (options?.forwardParams !== false) {
      const args = process.argv.slice(2);
      cmd = `${command}${args.length > 0 ? ` ${args.join(' ')}` : ''}`;
    } else {
      cmd = command;
    }

    if (!options?.silent) {
      console.log(`${options?.outputPrefix ?? ''}${cmd}`);
    }
    const startTime = performance.now();
    spawn('sh', ['-c', cmd], {
      stdio: 'inherit',
      ...options
    }).on('close', (code) => {
      if (code) {
        reject(`${options?.outputPrefix ?? ''}'${cmd}' failed with code ${code} (${printDuration(startTime)})`);
      } else {
        if (!options?.silent) {
          console.log(`${options?.outputPrefix ?? ''}${cmd} completed in ${printDuration(startTime)}`);
        }
        resolve(code);
      }
    });
  });
