import type {Command} from 'commander';

import {listAction} from '../actions/list-action';

export function registerListCommand(cmd: Command) {
  cmd
    .command('list')
    .description('Lists installed BlakeUI packages (@blakeui/react, @blakeui/styles)')
    .option('-p --packagePath [string]', 'Specify the path to the package.json file')
    .action(listAction);
}
