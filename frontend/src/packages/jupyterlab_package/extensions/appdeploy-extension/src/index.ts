import * as pathToRegexp from 'path-to-regexp';

import {
    JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

// import {
//     IDisposable, DisposableDelegate
// } from '@phosphor/disposable';

import {
    ToolbarButton
    , Dialog, showDialog
} from '@jupyterlab/apputils';

// import {
//     DocumentRegistry
// } from '@jupyterlab/docregistry';

import {
    IFileBrowserFactory
} from '@jupyterlab/filebrowser';

import {
    Form
} from './vdomWrapper';


import {publish} from './service'

import '../style/index.css';


/**
 * The class name added to toolbar deploy button.
 */
const TOOLBAR_DEPLOY_CLASS = 'jp-LauncherIcon';

/**
 * Initialization data for the moduledeploy-extension extension.
 */
const extension: JupyterLabPlugin<void> = {
    id: '@jupyterlab/appdeploy-extension:plugin',
    autoStart: true,
    requires: [IFileBrowserFactory],
    activate: (app: JupyterLab, fb: IFileBrowserFactory) => {
        console.log(app, fb.defaultBrowser);
        const widget = fb.defaultBrowser;

        widget.toolbar.insertItem(4, 'publishModule', createDeployButton());
    }
};

/**
 * A widget used to rename a file.
 */
class DeployForm extends Form {

    /**
     * Get the input text node.
     */
    get inputNode(): HTMLInputElement {
        return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
    }

    /**
     * Get the value of the widget.
     */
    getValue(): string {
        // return this.inputNode.value;
        return '11';
    }
}


/**
 * Create a deploy toolbar item.
 */
export function createDeployButton(): ToolbarButton {
    const hash = window.location.hash;
    const match = pathToRegexp('#/workspace/:projectId/:type').exec(hash);
    if (match) {
        let projectId = match[1];
        return new ToolbarButton({
            className: TOOLBAR_DEPLOY_CLASS,
            onClick: () => {
                return showDialog({
                    title: 'Publishing ' + document.title.split(' - ')[0],
                    body: new DeployForm(() => {
                        console.log('click');
                        publish({projectId});
                    }),
                    focusNodeSelector: 'input',
                    buttons: [Dialog.cancelButton(), Dialog.okButton({label: 'PUBLISH'})]
                }).then(result => {
                    console.log('then');
                    if (!result.value) {
                        return null;
                    }
                    console.log(result.value);
                    publish({projectId});
                    // return deploy(context);
                });
            },
            tooltip: 'Deploy Script'
        });
    } else {
        throw Error;
    }
}

export default extension;
