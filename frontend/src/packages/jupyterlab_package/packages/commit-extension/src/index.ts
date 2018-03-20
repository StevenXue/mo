import * as pathToRegexp from 'path-to-regexp';
import { message } from 'antd';

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

import { commit } from './service';

import '../style/index.css';

/**
 * The class name added to toolbar deploy button.
 */
const TOOLBAR_COMMIT_CLASS = 'jp-CommitIcon';

/**
 * Initialization data for the moduledeploy-extension extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: '@jupyterlab/commit-extension:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterLab, fb: IFileBrowserFactory) => {
    fb.defaultBrowser.toolbar.addItem('commit', createDeployButton());
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
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
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
      className: TOOLBAR_COMMIT_CLASS,
      onClick: () => {
        return showDialog({
          title: 'Commit ' + document.title.split(' - ')[0],
          body: new DeployForm(() => {
            console.log('click');
          }),
          focusNodeSelector: 'input',
          buttons: [Dialog.cancelButton(), Dialog.okButton({ label: 'Commit' })],
        }).then(result => {
          if (!result.value) {
            return null;
          }
          console.log(result.value);
          const commitMsg = result.value;
          commit({
            projectId,
            commitMsg,
            onJson: () => {
              message.success('Commit and Push: ' + result.value);
            },
          });
          // return deploy(context);
        });
      },
      tooltip: 'Deploy Script',
    });
  } else {
    throw Error;
  }
}

export default extension;
