import {
    JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
    IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {
    ToolbarButton
} from '@jupyterlab/apputils';

import {
    DocumentRegistry
} from '@jupyterlab/docregistry';

import {
    NotebookActions, NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';


import '../style/index.css';


/**
 * Initialization data for the moduledeploy-extension extension.
 */
const extension: JupyterLabPlugin<void> = {
    id: '@jupyterlab/moduledeploy-extension:plugin',
    autoStart: true,
    activate: (app: JupyterLab) => {
        app.docRegistry.addWidgetExtension('filebrowser', new ButtonExtension());
    }
};


/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
    /**
     * Create a new extension object.
     */
    createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
        let callback = () => {
            NotebookActions.runAll(panel.notebook, context.session);
        };
        let button = new ToolbarButton({
            className: 'myButton',
            onClick: callback,
            tooltip: 'Run All'
        });

        let i = document.createElement('i');
        i.classList.add('fa', 'fa-fast-forward');
        button.node.appendChild(i);

        panel.toolbar.insertItem(0, 'runAll', button);
        return new DisposableDelegate(() => {
            button.dispose();
        });
    }
}

export default extension;
