// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  INotebookTracker
} from '@jupyterlab/notebook';

// import {
//   each
// } from '@phosphor/algorithm';

// import {
//   Widget
// } from '@phosphor/widgets';

import '../style/index.css';

// import renderReact from './react_index';
import {
  ModulePageWrapper
} from './vdomWrapper';
/**
 * The default tab manager extension.
 */
const plugin: JupyterLabPlugin<void> = {
  id: '@jupyterlab/datasets-extension:plugin',
  activate: (app: JupyterLab, restorer: ILayoutRestorer, tracker: INotebookTracker): void => {
    const { shell } = app;
    const modulePage = new ModulePageWrapper(app, tracker);
    restorer.add(modulePage, 'datasets-manager');
    modulePage.id = 'datasets-manager';
    modulePage.title.label = 'Datasets';
    shell.addToRightArea(modulePage, { rank: 600 });
    shell.activateById(modulePage.id);
  },
  autoStart: true,
  requires: [ILayoutRestorer, INotebookTracker]
};


/**
 * Export the plugin as default.
 */
export default plugin;
