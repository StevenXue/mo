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
  const { commands, shell } = app;
  const model = new LauncherModel();

  commands.addCommand(CommandIDs.create, {
    label: 'New Launcher',
    execute: (args: JSONObject) => {
      const cwd = args['cwd'] ? String(args['cwd']) : '';
      const id = `launcher-${Private.id++}`;
      const callback = (item: Widget) => {
        shell.addToMainArea(item, { ref: id });
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
                `# Please use current (work) folder to store your data and models\n`,
                `import os\n`,
                `import sys\n`,
                `sys.path.append('${sysPath}')\n`,
                `\n`,
                `from modules import json_parser\n`,
                `from modules import Client\n`,
                `\n`,
                `client = Client('fackAPI', project_id='${projectId}', user_ID='${localStorage.getItem('user_ID')}',\n`,
                `                project_type='${type}', source_file_path='${(item as any).context.path}')\n`,
                `run = client.run\n`,
                `train = client.train\n`,
                `predict = client.predict\n`,
                `\n`,
                `# append work_path to head when you want to reference a path inside the working directory\n`,
                `work_path = ''`,
              ], (item as any).session);
          }
        }
      };
      const launcher = new Launcher({ cwd, callback });

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

  palette.addItem({ command: CommandIDs.create, category: 'Launcher' });

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
