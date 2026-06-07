import type {CommandName, SAFE_ANY} from '@helpers/type';

import {Logger, gradientString} from '@helpers/logger';
import {findMostMatchText} from '@helpers/math-diff';
import {outputBox} from '@helpers/output-info';
import {getCommandDescAndLog} from '@helpers/utils';
import chalk from 'chalk';
import {Command} from 'commander';

import pkg from '../package.json';

import {getAnalytics, shutdown} from './analytics';
import {registerCommands} from './commands';
import {getStore, store} from './constants/store';
import {initCache} from './scripts/cache/cache';
import {compareVersions} from './scripts/helpers';

const commandList: CommandName[] = [
  'install',
  'agents-md',
  'env',
  'init',
  'list',
  'upgrade',
  'doctor',
  'uninstall'
];

const blakeui = new Command();

blakeui
  .name('blakeui')
  .usage('[command]')
  .description(getCommandDescAndLog(`\nBlakeUI CLI v${pkg.version}\n`, ''))
  .version(pkg.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command')
  .allowUnknownOption()
  .option(
    '--no-cache',
    'Disable cache, by default data will be cached for 30m after the first request'
  )
  .option('-d, --debug', 'Debug mode will not install dependencies')
  .action(async (_, command) => {
    let isArgs = false;

    if (command) {
      const args = command.args?.[0];

      if (args && !commandList.includes(args as CommandName)) {
        isArgs = true;

        const matchCommand = findMostMatchText(commandList, args);

        if (matchCommand) {
          Logger.error(
            `Unknown command '${args}', Did you mean '${chalk.underline(matchCommand)}'?`
          );
        } else {
          Logger.error(`Unknown command '${args}'`);
        }
      }
    }

    if (!isArgs) {
      const helpInfo = blakeui.helpInformation();

      let helpInfoArr = helpInfo.split('\n');

      helpInfoArr = helpInfoArr.filter((info) => info && !info.includes('BlakeUI CLI v'));
      // Add command name color
      helpInfoArr = helpInfoArr.map((info) => {
        const command = info.match(/(\w+)\s\[/)?.[1];

        if (command) {
          return info.replace(command, chalk.cyan(command));
        }

        return info;
      });

      Logger.log(helpInfoArr.join('\n'));
    }
    process.exit(0);
  });

registerCommands(blakeui);

blakeui.hook('preAction', async (command) => {
  const commandName = command.args?.[0];
  const options = (command as SAFE_ANY).rawArgs.slice(2);
  const noCache = options.includes('--no-cache');
  const debug = options.includes('--debug') || options.includes('-d');

  if (!commandName) {
    return;
  }

  // Init cache
  initCache(noCache);
  // Init debug
  store.debug = debug;
  store.beta = options.includes('-b') || options.includes('--beta');

  const [cliLatestVersion] = await Promise.all([getStore('cliLatestVersion')]);

  // Init latest version
  store.cliLatestVersion = cliLatestVersion;

  // Add BlakeUI CLI version check preAction
  const currentVersion = pkg.version;

  if (compareVersions(currentVersion, cliLatestVersion) === -1) {
    outputBox({
      center: true,
      color: 'yellow',
      padding: 1,
      text: `${chalk.gray(
        `Available upgrade: v${currentVersion} -> ${chalk.greenBright(
          `v${cliLatestVersion}`
        )}\nRun \`${chalk.cyan(
          'npm install -g @blakeui/cli@latest'
        )}\` to upgrade\nChangelog: ${chalk.underline(
          'https://github.com/myblakebox/BlakeUI/releases'
        )}`
      )}`,
      title: gradientString('BlakeUI CLI')
    });
    Logger.newLine();
  }
});

blakeui.parseAsync(process.argv).catch(async (error: Error) => {
  const isAgentsMd = process.argv.includes('agents-md');

  if (isAgentsMd) {
    const analytics = getAnalytics();

    analytics?.trackError({
      error,
      errorEvent: 'AGENTS_MD_ERROR',
      fallbackMessage: 'Unexpected error in agents-md',
      properties: {}
    });
    await shutdown();
  }

  Logger.newLine();
  Logger.error('Unexpected error. Please report it as a bug:');
  Logger.log(error.message);
  if (error.stack) {
    Logger.grey(error.stack);
  }
  Logger.newLine();
  process.exit(1);
});
