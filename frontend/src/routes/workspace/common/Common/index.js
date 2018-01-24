import React, { Component } from 'react'
import { Spin, Button } from 'antd'
import { connect } from 'dva'
import SideBar from '../components/SideBar/index'
import MiddleArea from '../components/MiddleArea/index'
import RightArea from '../components/RightArea/index'
import styles from './index.less'


// ES6 Promise polyfill
require('es6-promise/auto')

// Load the core theming before any other package.
require('../../../../packages/jupyterlab/packages/theme-light-extension/style/embed.css')
require('../../../../packages/jupyterlab/node_modules/font-awesome/css/font-awesome.min.css')

let JupyterLab = require('../../../../packages/jupyterlab/packages/application').JupyterLab

let mods = [
  require('../../../../packages/jupyterlab/packages/application-extension'),
  require('../../../../packages/jupyterlab/packages/apputils-extension'),
  require('../../../../packages/jupyterlab/packages/codemirror-extension'),
  require('../../../../packages/jupyterlab/packages/completer-extension'),
  require('../../../../packages/jupyterlab/packages/console-extension'),
  require('../../../../packages/jupyterlab/packages/csvviewer-extension'),
  require('../../../../packages/jupyterlab/packages/docmanager-extension'),
  require('../../../../packages/jupyterlab/packages/fileeditor-extension'),
  require('../../../../packages/jupyterlab/packages/faq-extension'),
  require('../../../../packages/jupyterlab/packages/filebrowser-extension'),
  require('../../../../packages/jupyterlab/packages/help-extension'),
  require('../../../../packages/jupyterlab/packages/imageviewer-extension'),
  require('../../../../packages/jupyterlab/packages/inspector-extension'),
  require('../../../../packages/jupyterlab/packages/launcher-extension'),
  require('../../../../packages/jupyterlab/packages/mainmenu-extension'),
  require('../../../../packages/jupyterlab/packages/markdownviewer-extension'),
  require('../../../../packages/jupyterlab/packages/mathjax2-extension'),
  require('../../../../packages/jupyterlab/packages/notebook-extension'),
  require('../../../../packages/jupyterlab/packages/rendermime-extension'),
  require('../../../../packages/jupyterlab/packages/running-extension'),
  require('../../../../packages/jupyterlab/packages/settingeditor-extension'),
  require('../../../../packages/jupyterlab/packages/shortcuts-extension'),
  require('../../../../packages/jupyterlab/packages/tabmanager-extension'),
  require('../../../../packages/jupyterlab/packages/terminal-extension'),
  require('../../../../packages/jupyterlab/packages/theme-dark-extension'),
  require('../../../../packages/jupyterlab/packages/theme-light-extension'),
  require('../../../../packages/jupyterlab/packages/tooltip-extension'),

  require('../../../../packages/jupyterlab/packages/modules-extension')
]

class Common extends Component {

  componentDidMount() {
    let lab = new JupyterLab({
      name: 'Mo Lab',
      namespace: 'mo-lab',
      version: 'unknown'
    })
    lab.registerPluginModules(mods)
    lab.start({ hostID: 'mo-jlContainer' })
  }

  render() {
    return (
      <div className={styles.container} id='mo-jlContainer'>


      </div>
    )
  }
}

// function Common(props) {
//
//   return (
//     <div className={styles.container}>
//
//       <Spin spinning={false}>
//
//         <div className={styles.content}>
//           <div className={styles.sidebar}>
//             <SideBar
//               {...props}
//             />
//           </div>
//           <div className={styles.middle_area}>
//             <MiddleArea
//               {...props}
//             />
//           </div>
//           <div className={styles.right_area}>
//             <RightArea
//               {...props}
//             />
//           </div>
//         </div>
//       </Spin>
//
//       <div className={styles.go_guide}>
//         <Button onClick={() => props.dispatch({
//           type: props.namespace + '/setShowGuidance',
//           payload: {
//             showGuidance: true,
//           },
//         })}>
//           go to guidance
//         </Button>
//       </div>
//
//     </div>
//   )
// }

export default connect(({ notebook, projectDetail }) => ({ notebook, projectDetail }))(Common)

// export default Common;
