// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import * as pathToRegexp from 'path-to-regexp';

import {
  JupyterLab, JupyterLabPlugin,
} from '@jupyterlab/application';

import {
  ICommandPalette,
} from '@jupyterlab/apputils';

import {
  ILauncher, LauncherModel, Launcher,
} from '@jupyterlab/launcher';

import {
  toArray,
} from '@phosphor/algorithm';

import {
  JSONObject,
} from '@phosphor/coreutils';

import {
  Widget,
} from '@phosphor/widgets';

import {
  NotebookActions,
} from '@jupyterlab/notebook';

import '../style/index.css';

/**
 * The command IDs used by the launcher plugin.
 */
namespace CommandIDs {
  export const create = 'launcher:create';
}

/**
 * A service providing an interface to the the launcher.
 */
const plugin: JupyterLabPlugin<ILauncher> = {
  activate,
  id: '@jupyterlab/launcher-extension:plugin',
  requires: [ICommandPalette],
  provides: ILauncher,
  autoStart: true,
};

/**
 * Export the plugin as default.
 */
export default plugin;


/**
 * Activate the launcher.
 */
function activate(app: JupyterLab, palette: ICommandPalette): ILauncher {
  const {commands, shell} = app;
  const model = new LauncherModel();

  commands.addCommand(CommandIDs.create, {
    label: 'New Launcher',
    execute: (args: JSONObject) => {
      const cwd = args['cwd'] ? String(args['cwd']) : '';
      const id = `launcher-${Private.id++}`;
      const callback = (item: Widget) => {
        shell.addToMainArea(item, {ref: id});
        shell.activateById(item.id);
        console.log('item', item);
        if (item.hasOwnProperty('notebook')) {
          const hash = window.location.hash;
          const match = pathToRegexp('#/workspace/:projectId/:type').exec(hash);
          if (match) {
            let projectId = match[1];
            let type = match[2];
            const notebookPath = (item as any).context.path;
            let sysPath = '../'.repeat(notebookPath.split('/').length);

            NotebookActions.insertInitCode((item as any).notebook,
              [
                '# You can use other public modules via our Client object with module\'s identifier \n',
                '# and parameters.\n',
                '# For more detailes, please see our online document - https://momodel.github.io/mo/#\n',
                '\n',
                'import os\n',
                'import sys\n',
                '\n',
                '# Define root path\n',
                `sys.path.append('${sysPath}')\n`,
                '\n',
                '# Import necessary packages\n',
                'from modules import json_parser\n',
                'from modules import Client\n',
                '\n',
                '# Initialise Client object\n',
                `client = Client(api_key='5asdfoasd0fnd0983', project_id='${projectId}', user_ID='${localStorage.getItem('user_ID')}',\n`,
                `                project_type='${type}', source_file_path='${(item as any).context.path}')\n`,
                '\n',
                '# Make run/train/predict commnad alias for furthur use\n',
                'run = client.run\n',
                'train = client.train\n',
                'predict = client.predict\n',
                '\n',
                '# Run a importred module \n',
                '# e.g. \n',
                '#      conf = json_parser(\'{"rgb_image":null,"gray_image":null}\') \n',
                '#      result = run(\'zhaofengli/new_gender_classifier/0.0.2\', conf)\n',
                '#\n',
                '# \'conf\' is the parameters in dict form for the imported module\n',
                '# \'[user_id]/[imported_module_name]/[version]\' is the identifier of the imported module\n',
                '\n',
                '\n',
                '# Make controller alias for further use\n',
                'controller = client.controller\n',
                '\n',
                '# IMPORTANT: Add \'work_path\' to the head of every file path in your code.\n',
                '# e.g.\n',
                '#      jpgfile = Image.open(work_path + "picture.jpg") \n',
                'work_path = \'./\''
              ], (item as any).session);
          }
        }
      };
      const launcher = new Launcher({cwd, callback});

      launcher.model = model;
      launcher.id = id;
      launcher.title.label = 'Launcher';
      launcher.title.iconClass = 'jp-LauncherIcon';

      // If there are any other widgets open, remove the launcher close icon.
      launcher.title.closable = !!toArray(shell.widgets('main')).length;

      shell.addToMainArea(launcher);
      if (args['activate'] !== false) {
        shell.activateById(launcher.id);
      }

      shell.layoutModified.connect(() => {
        // If there is only a launcher open, remove the close icon.
        launcher.title.closable = toArray(shell.widgets('main')).length > 1;
      }, launcher);

      return launcher;
    },
  });

  palette.addItem({command: CommandIDs.create, category: 'Launcher'});

  return model;
}

/**
 * The namespace for module private data.
 */
namespace Private {
  /**
   * The incrementing id used for launcher widgets.
   */
  export let id = 0;
}
