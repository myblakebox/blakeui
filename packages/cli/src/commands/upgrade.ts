import type {Command} from 'commander';

import {upgradeAction} from '../actions/upgrade-action';

export function registerUpgradeCommand(cmd: Command) {
  cmd
    .command('upgrade')
    .description('Upgrades @blakeui/react and @blakeui/styles to the latest versions')
    .option('-p --packagePath [string]', 'Specify the path to the package.json file')
    .action(upgradeAction);
}
