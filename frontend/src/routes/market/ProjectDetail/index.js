import React from 'react'
import {
  Route,
  Link,
  Switch,
} from 'react-router-dom'
import { connect } from 'dva'
import { Icon, Button, Tag, Modal, Tabs, Spin, Row, Col } from 'antd'


import ProjectInfo from '../../workspace/info/ProjectDetail'

const ProjectInfo = () => <ProjectInfo market_use={true}/>


// export default connect(({ }) => ({  }))(MarketProjectInfo)
// export default connect(({ projectDetail }) => ({ projectDetail }))(ProjectInfo)
