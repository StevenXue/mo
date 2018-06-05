// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import * as React from 'react';

// import {
//     Input, Select
// } from 'antd';

import {
  VDomRenderer,
} from '@jupyterlab/apputils';

// const Option = Select.Option;

import { DeployPage } from './reactIndex';

/**
 * The CSS class added to form.
 */
const FORM_CLASS = 'jp-Form';

/**
 * The CSS class added to inputs.
 */
// const INPUT_CLASS = 'jp-Input';

/**
 * The CSS class added to placeholder content.
 */

// const CONTENT_CLASS = 'jp-Form-content';

/**
 * An abstract base class for placeholders
 *
 * ### Notes
 * A placeholder is the element that is shown when input/output
 * is hidden.
 */
export class Form extends VDomRenderer<null> {
  /**
   * Construct a new placeholder.
   */
  constructor(projectType: string, callback: (e: React.MouseEvent<HTMLDivElement>) => void) {
    super();
    this.addClass(FORM_CLASS);
    this._projectType = projectType;
    this._callback = callback;
  }

  /**
   * Handle the click event.
   */
  protected handleClick(e: React.MouseEvent<HTMLDivElement>): void {
    let callback = this._callback;
    callback(e);
  }

  private _projectType: string;
  private _callback: (e: React.MouseEvent<HTMLDivElement>) => void;

  /**
   * Render the input placeholder using the virtual DOM.
   */
  protected render(): React.ReactElement<any> {
    const props = {projectType: this._projectType};
    return (
      <div>
        <input style={{display: 'none'}} className='testingState'/>
        <input style={{ display: 'none' }} className='fileSelect'/>
        <input style={{ display: 'none' }} className='versionNumber'/>
        <DeployPage {...props}/>
      </div>
    );
  }
}

