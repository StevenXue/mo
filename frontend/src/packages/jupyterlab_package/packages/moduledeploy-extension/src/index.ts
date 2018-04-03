import * as pathToRegexp from 'path-to-regexp';
import {message} from 'antd';

import {
    JupyterLab, JupyterLabPlugin,
} from '@jupyterlab/application';

// import {
//     IDisposable, DisposableDelegate
// } from '@phosphor/disposable';

import {
    ToolbarButton
    , Dialog, showDialog,
} from '@jupyterlab/apputils';

// import {
//     DocumentRegistry
// } from '@jupyterlab/docregistry';

import {
    IFileBrowserFactory,
} from '@jupyterlab/filebrowser';

import {
    Form,
} from './vdomWrapper';

import {publish} from './service';

import '../style/index.css';

/**
 * The class name added to toolbar deploy button.
 */
const TOOLBAR_DEPLOY_CLASS = 'jp-LauncherIcon';

/**
 * Initialization data for the moduledeploy-extension extension.
 */
const extension: JupyterLabPlugin<void> = {
    id: '@jupyterlab/moduledeploy-extension:plugin',
    autoStart: true,
    requires: [IFileBrowserFactory],
    activate: (app: JupyterLab, fb: IFileBrowserFactory) => {
        fb.defaultBrowser.toolbar.addItem('publishModule', createDeployButton());
    },
};

/**
 * A widget used to rename a file.
 */
class DeployForm extends Form {

    /**
     * Get the input text node.
     */
    get inputNode(): HTMLInputElement {
        return this.node.getElementsByClassName('testing-state')[0] as HTMLInputElement;
    }

    /**
     * Get the value of the widget.
     */
    getValue(): string {
        return this.inputNode.value;
        // return '11';
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
                    title: 'Publish ' + document.title.split(' - ')[0],
                    body: new DeployForm(() => {
                        console.log('click');
                    }),
                    focusNodeSelector: 'input',
                    buttons: [Dialog.cancelButton(), Dialog.okButton({label: 'PUBLISH'})],
                }).then(result => {
                    console.log(result);
                    if (result.button.label === 'CANCEL') {
                        return;
                    }
                    if (result.value) {
                        if (result.value === 'failed') {
                            message.error('Test not passed, please fix warnings!');
                        } else {
                            publish({
                                projectId,
                                onJson: () => {
                                    message.success('Module deploy success!');
                                },
                            });
                        }
                    } else {
                        message.error('Please wait until testing finished!');
                    }
                });
            },
            tooltip: 'Publish Module',
        });
    } else {
        throw Error;
    }
}

export default extension;
