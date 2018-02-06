import React, { Component } from 'react'
import { Spin, Button } from 'antd'
import { connect } from 'dva'
import SideBar from '../components/SideBar/index'
import MiddleArea from '../components/MiddleArea/index'
import RightArea from '../components/RightArea/index'
import styles from './index.less'
import { hubPrefix } from '../../../../utils/config'

const loadnStartJL = () => {
  // ES6 Promise polyfill
  require('es6-promise/auto')

// Load the core theming before any other package.
  require('../../../../packages/jupyterlab_package/packages/theme-light-extension/style/embed.css')
  require('../../../../packages/jupyterlab_package/node_modules/font-awesome/css/font-awesome.min.css')

  let JupyterLab = require('../../../../packages/jupyterlab_package/packages/application').JupyterLab

  let mods = [
    require('../../../../packages/jupyterlab_package/packages/application-extension'),
    require('../../../../packages/jupyterlab_package/packages/apputils-extension'),
    require('../../../../packages/jupyterlab_package/packages/codemirror-extension'),
    require('../../../../packages/jupyterlab_package/packages/completer-extension'),
    require('../../../../packages/jupyterlab_package/packages/console-extension'),
    require('../../../../packages/jupyterlab_package/packages/csvviewer-extension'),
    require('../../../../packages/jupyterlab_package/packages/docmanager-extension'),
    require('../../../../packages/jupyterlab_package/packages/fileeditor-extension'),
    require('../../../../packages/jupyterlab_package/packages/faq-extension'),
    require('../../../../packages/jupyterlab_package/packages/filebrowser-extension'),
    require('../../../../packages/jupyterlab_package/packages/help-extension'),
    require('../../../../packages/jupyterlab_package/packages/imageviewer-extension'),
    require('../../../../packages/jupyterlab_package/packages/inspector-extension'),
    require('../../../../packages/jupyterlab_package/packages/launcher-extension'),
    require('../../../../packages/jupyterlab_package/packages/mainmenu-extension'),
    require('../../../../packages/jupyterlab_package/packages/markdownviewer-extension'),
    require('../../../../packages/jupyterlab_package/packages/mathjax2-extension'),
    require('../../../../packages/jupyterlab_package/packages/notebook-extension'),
    require('../../../../packages/jupyterlab_package/packages/rendermime-extension'),
    require('../../../../packages/jupyterlab_package/packages/running-extension'),
    require('../../../../packages/jupyterlab_package/packages/settingeditor-extension'),
    require('../../../../packages/jupyterlab_package/packages/shortcuts-extension'),
    require('../../../../packages/jupyterlab_package/packages/tabmanager-extension'),
    require('../../../../packages/jupyterlab_package/packages/terminal-extension'),
    require('../../../../packages/jupyterlab_package/packages/theme-dark-extension'),
    require('../../../../packages/jupyterlab_package/packages/theme-light-extension'),
    require('../../../../packages/jupyterlab_package/packages/tooltip-extension'),

    require('../../../../packages/jupyterlab_package/packages/modules-extension'),
  ]

  let lab = new JupyterLab({
    name: 'Mo Lab',
    namespace: 'mo-lab',
    version: 'unknown',
  })
  lab.registerPluginModules(mods)
  lab.start({ hostID: 'mo-jlContainer' })
}

const insertConfigData = (html) => {
  let el = document.implementation.createHTMLDocument()
  el.body.innerHTML = html
  let JCD = el.getElementById('jupyter-config-data')
  let jupyterConfigData = JSON.parse(JCD.innerHTML)
  for (let key in jupyterConfigData) {
    if (key === 'wsUrl' || key === 'pageUrl' || key === 'themesUrl') {
      continue
    }
    if (key.includes('Url')) {
      let value = jupyterConfigData[key]
      jupyterConfigData[key] = hubPrefix + value
    }
  }
  JCD.innerHTML = JSON.stringify(jupyterConfigData)
  document.head.insertBefore(JCD, document.head.children[3])
}

class Common extends Component {

  componentDidMount() {
    // const { projectDetail } = this.props
    // const { project } = projectDetail
    // const hubUserName = `${localStorage.getItem('user_ID')}~${project.name}`
    // fetch(`${hubPrefix}/hub/api/users/${hubUserName}/server`, {
    //   method: 'post',
    //   headers: {
    //     'Authorization': `token ${project.hub_token}`,
    //   },
    // }).then((res) => {
    //   fetch(`${hubPrefix}/user/${hubUserName}/lab`, {
    //     method: 'get',
    //     headers: {
    //       'Authorization': `token ${project.hub_token}`,
    //     },
    //   }).then((res) => {
    //     return res.text()
    //   }).then((html) => {
    //     insertConfigData(html)
    //     loadnStartJL()
    //   })
    // })
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
