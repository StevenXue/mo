import * as pathToRegexp from 'path-to-regexp';
import { message } from 'antd';

import {
    BoxLayout, Widget,
} from '@phosphor/widgets';

import {
    JupyterLab, JupyterLabPlugin,
} from '@jupyterlab/application';

import {
    IDisposable, DisposableDelegate,
} from '@phosphor/disposable';

import {
    ToolbarButton
    , Dialog, showDialog,
} from '@jupyterlab/apputils';

import {
    DocumentRegistry,
} from '@jupyterlab/docregistry';

import {
    Toolbar,
} from '@jupyterlab/apputils';

import {
    FileEditor,
} from '@jupyterlab/fileeditor';

import {
    IFileBrowserFactory,
} from '@jupyterlab/filebrowser';

import {
    Form,
} from './vdomWrapper';

import {
    deploy,
} from './service';

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
        // add to filebrowser toolbar
        fb.defaultBrowser.toolbar.addItem('publishModule', createDeployButton());

        // add to editor toolbar
        app.docRegistry.addWidgetExtension('Editor', new ButtonExtension());
    },
};

/**
 * A notebook widget extension that adds a button to the toolbar.
 */
export class ButtonExtension implements DocumentRegistry.IWidgetExtension<FileEditor, DocumentRegistry.IModel> {
    /**
     * Create a new extension object.
     */
    createNew(fileeditor: FileEditor, context: DocumentRegistry.Context): IDisposable {
        let layout = fileeditor.layout as BoxLayout;
        let toolbar = layout.widgets[0] as Toolbar<Widget>;
        let button = createDeployButton();
        toolbar.addItem('deployApp', button);
        return new DisposableDelegate(() => {
            button.dispose();
        });
    }
}

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
                    title: 'Deploy ' + document.title.split(' - ')[0],
                    body: new DeployForm(() => {
                        console.log('click');
                    }),
                    focusNodeSelector: 'input',
                    buttons: [Dialog.cancelButton(), Dialog.okButton({label: 'DEPLOY'})],
                }).then(result => {
                    console.log('then');
                    if (!result.value) {
                        return null;
                    }
                    console.log(result.value);
                    // const hide = message.loading('App deploying...', 0);
                    deploy({
                        projectId, onJson: () => {
                            message.success('App deploy success!');
                            // hide();
                        },
                    });
                    window.location.replace(`/#/workspace/${projectId}?type=app`);
                    window.location.reload();
                });
            },
            tooltip: 'Deploy App',
        });
    } else {
        throw Error;
    }
}

export default extension;
