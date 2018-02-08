import React, { Component } from 'react'
import { Spin, Button } from 'antd'
import { connect } from 'dva'
import SideBar from '../components/SideBar/index'
import MiddleArea from '../components/MiddleArea/index'
import RightArea from '../components/RightArea/index'
import styles from './index.less'

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
