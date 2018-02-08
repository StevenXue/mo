import * as React from 'react'
import { Card, Button, Row, Col } from 'antd'

import {
  VDomRenderer, VDomModel
} from '@jupyterlab/apputils';

import {
  NotebookActions,
} from '@jupyterlab/notebook'

import ParamsMapper from './ParamsMapper'

import { getModules, getModule } from './services'
import { ModulePage } from './reactIndex'
import { ILauncher, ILauncherItem } from '../../metapackage/lib/launcher/src'

function genConf(args) {
  return JSON.stringify(args).replace(/'/g, '`')
}

export
class ModulePageWrapper extends VDomRenderer {

  constructor(app, tracker) {
    super()
    this.state = {
      app,
      tracker
    }
  }

  render() {
      return (
        <ModulePage {...this.state} />
      )
  }

}


