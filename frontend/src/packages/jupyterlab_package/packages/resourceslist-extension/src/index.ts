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
    ReactPageWrapper
} from './vdomWrapper';

/**
 * The default tab manager extension.
 */
const plugin: JupyterLabPlugin<void> = {
    id: '@jupyterlab/resourceslist-extension:plugin',
    activate: (app: JupyterLab, restorer: ILayoutRestorer, tracker: INotebookTracker): void => {
        const {shell} = app;

        const modulePage = new ReactPageWrapper(app, tracker, 'module');
        restorer.add(modulePage, 'modules-manager');
        modulePage.id = 'list-manager';
        modulePage.title.label = 'Modules';
        modulePage.title.className = 'ModulesLabel';
        shell.addToRightArea(modulePage, {rank: 600});
        shell.activateById(modulePage.id);

        const datasetPage = new ReactPageWrapper(app, tracker, 'dataset');
        restorer.add(datasetPage, 'datasets-manager');
        datasetPage.id = 'list-manager';
        datasetPage.title.label = 'Datasets';
        datasetPage.title.className = 'DatasetsLabel';
        shell.addToRightArea(datasetPage, {rank: 600});
        shell.activateById(datasetPage.id);
    },
    autoStart: true,
    requires: [ILayoutRestorer, INotebookTracker]
};


/**
 * Export the plugin as default.
 */
export default plugin;
