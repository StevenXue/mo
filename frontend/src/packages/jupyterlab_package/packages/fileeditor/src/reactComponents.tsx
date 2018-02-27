// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import * as React from 'react';

import {
    Input, Select
} from 'antd';

import {
    VDomRenderer
} from '@jupyterlab/apputils';

const Option = Select.Option;

/**
 * The CSS class added to form.
 */
const FORM_CLASS = 'jp-Form';

/**
 * The CSS class added to inputs.
 */
const INPUT_CLASS = 'jp-Input';

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
    constructor(callback: (e: React.MouseEvent<HTMLDivElement>) => void) {
        super();
        this.addClass(FORM_CLASS);
        this._callback = callback;
    }

    /**
     * Handle the click event.
     */
    protected handleClick(e: React.MouseEvent<HTMLDivElement>): void {
        let callback = this._callback;
        callback(e);
    }

    private _callback: (e: React.MouseEvent<HTMLDivElement>) => void;

    /**
     * Render the input placeholder using the virtual DOM.
     */
    protected render(): React.ReactElement<any> {
        return (
            <div>
                <Input className={INPUT_CLASS} key='input'>
                </Input>
                <Select defaultValue='86' style={{width: 70}} dropdownStyle={{zIndex: 10001}}>
                    <Option value='86'>86</Option>
                    <Option value='87'>87</Option>
                </Select>
                <br/>
                <Select defaultValue='86' style={{width: 70}} dropdownStyle={{zIndex: 10001}}>
                    <Option value='86'>86</Option>
                    <Option value='87'>87</Option>
                </Select>
                <br/>

                <Select defaultValue='86' style={{width: 70}} dropdownStyle={{zIndex: 10001}}>
                    <Option value='86'>86</Option>
                    <Option value='87'>87</Option>
                </Select>
                <br/>

                <Select defaultValue='86' style={{width: 70}} dropdownStyle={{zIndex: 10001}}>
                    <Option value='86'>86</Option>
                    <Option value='87'>87</Option>
                </Select>
            </div>
        );
    }
}

