import React from 'react'
import PropTypes from 'prop-types'
import { Router, routerRedux } from 'dva/router'
import { connect } from 'dva'
import { FileSystem } from './components'
import './index.less'
import { color } from '../../utils'

const bodyStyle = {
  bodyStyle: {
    height: 432,
    background: '#fff',
  },
}

function Dashboard ({ dispatch }) {

  return (
    <div style={bodyStyle}>
      <FileSystem dispatch={dispatch} />
    </div>
  )
}

// Dashboard.propTypes = {
//   dispatch: PropTypes.shape,
// }
//
// Dashboard.defaultProps = {
//   dispatch: {},
// }

export default connect(({ project }) => ({ project }))(Dashboard)
