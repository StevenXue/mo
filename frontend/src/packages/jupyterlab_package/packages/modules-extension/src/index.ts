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

import {
  TabBar, Widget
} from '@phosphor/widgets';

import '../style/index.css';

import renderReact from './react'

/**
 * The default tab manager extension.
 */
const plugin: JupyterLabPlugin<void> = {
  id: '@jupyterlab/modules-extension:plugin',
  activate: (app: JupyterLab, restorer: ILayoutRestorer, tracker: INotebookTracker): void => {
    const { shell } = app;
    const tabs = new TabBar<Widget>({ orientation: 'vertical' });
    // const tabs = document.createElement('div');
    const header = document.createElement('header');
    restorer.add(tabs, 'tab-manager');
    tabs.id = 'tab-manager';
    tabs.title.label = 'Modules';
    header.textContent = 'Module List';
    tabs.node.insertBefore(header, tabs.contentNode);
    shell.addToRightArea(tabs, { rank: 600 });
    // renderReact(tabs.contentNode);

    app.restored.then(() => {
      // const populate = () => {
      //   tabs.clearTabs();
      //   each(shell.widgets('main'), widget => { tabs.addTab(widget.title); });
      // };
      //
      // // Connect signal handlers.
      // shell.layoutModified.connect(() => { populate(); });
      // tabs.tabActivateRequested.connect((sender, tab) => {
      //   shell.activateById(tab.title.owner.id);
      // });
      // tabs.tabCloseRequested.connect((sender, tab) => {
      //   tab.title.owner.close();
      // });
      //
      // // Populate the tab manager.
      // populate();
      // renderReact(header);

      renderReact(tabs.contentNode, app, tracker.currentWidget);

    });
  },
  autoStart: true,
  requires: [ILayoutRestorer, INotebookTracker]
};


/**
 * Export the plugin as default.
 */
export default plugin;
