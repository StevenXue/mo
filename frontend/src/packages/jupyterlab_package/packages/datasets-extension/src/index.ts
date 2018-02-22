// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  INotebookTracker
} from '@jupyterlab/notebook';

import '../style/index.css';

import {
  VDOMWrapper
} from './vdomWrapper';
/**
 * The default tab manager extension.
 */
const plugin: JupyterLabPlugin<void> = {
  id: '@jupyterlab/datasets-extension:plugin',
  activate: (app: JupyterLab, restorer: ILayoutRestorer, tracker: INotebookTracker): void => {
    const { shell } = app;
    const datasetPage = new VDOMWrapper(app, tracker);
    restorer.add(datasetPage, 'datasets-manager');
    datasetPage.id = 'datasets-manager';
    datasetPage.title.label = 'Datasets';
    shell.addToRightArea(datasetPage, { rank: 600 });
    // shell.activateById(datasetPage.id);
  },
  autoStart: true,
  requires: [ILayoutRestorer, INotebookTracker]
};


/**
 * Export the plugin as default.
 */
export default plugin;
