import type {CommandOptions} from '../helpers/type';

import {Logger} from '@helpers/logger';
import {outputComponents} from '@helpers/output-info';
import {getPackageInfo, transformPackageDetail} from '@helpers/package';
import {BLAKEUI_PACKAGES} from 'src/constants/required';

import {resolver} from '../../src/constants/path';

export async function listAction(options: CommandOptions) {
  const {packagePath = resolver('package.json')} = options;

  try {
    const {allDependencies, allDependenciesKeys} = getPackageInfo(packagePath);

    const installed = BLAKEUI_PACKAGES.filter((pkg) => allDependenciesKeys.has(pkg));

    if (!installed.length) {
      Logger.warn(
        'No BlakeUI packages found. Run `blakeui install` to install @blakeui/react and @blakeui/styles.'
      );

      return;
    }

    const components = await transformPackageDetail(installed, allDependencies);

    outputComponents({components, message: 'Installed BlakeUI packages:\n'});
  } catch (error) {
    Logger.prefix('error', `An error occurred while listing packages: ${error}`);
  }

  process.exit(0);
}
