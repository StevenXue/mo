import * as React from 'react'
import {Card, Button, Row, Col} from 'antd'

import {
    VDomRenderer, VDomModel
} from '@jupyterlab/apputils';

import {
    NotebookActions,
} from '@jupyterlab/notebook'

import ParamsMapper from './ParamsMapper'

import {ListPage} from './reactIndex'

function genConf(args) {
    return JSON.stringify(args).replace(/'/g, '`')
}

export class ReactPageWrapper extends VDomRenderer {

    constructor(app, tracker, pageType) {
        super()
        this.state = {
            app,
            tracker,
            pageType
        }
    }

    render() {
        return (
            <ListPage {...this.state} />
        )
    }

}