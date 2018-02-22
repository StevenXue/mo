import * as React from 'react'
import { Card, Button, Row, Col } from 'antd'

import {
  VDomRenderer, VDomModel
} from '@jupyterlab/apputils';

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import ParamsMapper from './ParamsMapper'

import { getDatasets, getModule } from './services'
import { DatasetPage } from './reactIndex'

function genConf(args) {
  return JSON.stringify(args).replace(/'/g, '`')
}

export
class VDOMWrapper extends VDomRenderer {

  constructor(app, tracker) {
    super()
    this.state = {
      app,
      tracker
    }
  }

  render() {
      return (
        <DatasetPage {...this.state} />
      )
  }

}


