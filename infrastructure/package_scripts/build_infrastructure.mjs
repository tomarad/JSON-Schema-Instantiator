//@ts-nocheck
import fs from 'fs/promises';
import { resolve } from 'path';
import prettier from 'prettier';

const DEFAULT_BUILD_SCRIPT = 'build';
const CLI_DIR = 'infrastructure/package_scripts';

const style = await fs
  .readFile(resolve(process.cwd(), 'infrastructure/prettier/prettier.config.json'))
  .then((file) => JSON.parse(file.toString()));

(async function buildVsCodeAndPackageJson() {
  // get a list of unique file names in the 'src/cli' folder
  /** @type {Set<{name: string; extension: string}>} */
  const uniqueFileNames = new Set();
  const directoryContents = await fs.readdir(CLI_DIR);
  await Promise.all(
    directoryContents.map(async (subPath) => {
      const stat = await fs.stat(resolve(CLI_DIR, subPath));
      if (stat.isFile()) {
        uniqueFileNames.add({
          name: subPath.substring(0, subPath.lastIndexOf('.')),
          extension: subPath.substring(subPath.lastIndexOf('.') + 1)
        });
      }
    })
  );

  // convert it to an array so we can work with it later
  const scripts = [...uniqueFileNames].sort((a, b) => a.name.localeCompare(b.name));

  // read package.json
  const packageJson = JSON.parse((await fs.readFile(resolve(process.cwd(), 'package.json'))).toString());

  // sort the scripts record to ensure the file doesn't keep changing because of order changes
  packageJson.scripts = scripts.reduce((accumulator, { name, extension }) => {
    accumulator[name] = `node --unhandled-rejections=strict ${CLI_DIR}/${name}.${extension}`;
    return accumulator;
  }, {});

  // format & write package.json
  await fs.writeFile(
    resolve(process.cwd(), 'package.json'),
    prettier.format(JSON.stringify(packageJson), {
      ...style,
      filepath: 'package.json'
    })
  );

  // .vscode/launch.json & .vscode/tasts.json
  const [launch, tasks] = await Promise.all([
    (() => fs.readFile(resolve(process.cwd(), '.vscode/launch.json')).then((res) => JSON.parse(res.toString())))(),
    (() => fs.readFile(resolve(process.cwd(), '.vscode/tasks.json')).then((res) => JSON.parse(res.toString())))()
  ]);

  tasks.tasks = [];
  launch.configurations = [];

  scripts.forEach(({ name, extension }) => {
    const program = `${CLI_DIR}/${name}.${extension}`;
    launch.configurations.push({
      name,
      program,
      env: {
        NODE_OPTIONS: '--inspect'
      },
      request: 'launch',
      outputCapture: 'std',
      skipFiles: ['<node_internals>/**'],
      type: 'node',
      internalConsoleOptions: 'openOnSessionStart'
    });
    tasks.tasks.push({
      type: 'shell',
      command: `node --unhandled-rejections=strict ${program}`,
      label: name.replace('_', ' - '),
      group:
        name === DEFAULT_BUILD_SCRIPT
          ? {
              kind: 'build',
              isDefault: true
            }
          : 'build'
    });
  });

  // sort the records to ensure the files doesn't keep changing because of order changes
  launch.configurations.sort((a, b) => a.name.localeCompare(b.name));
  tasks.tasks.sort((a, b) => a.label.localeCompare(b.label));

  // format & write launch.json
  let styled = prettier.format(JSON.stringify(launch), {
    ...style,
    filepath: 'launch.json'
  });
  fs.writeFile(resolve(process.cwd(), '.vscode/launch.json'), styled);

  // format & write tasks.json
  styled = prettier.format(JSON.stringify(tasks), {
    ...style,
    filepath: 'tasks.json'
  });
  fs.writeFile(resolve(process.cwd(), '.vscode/tasks.json'), styled);
})();
