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
  function handleToDetail (name, id) {
    dispatch(routerRedux.push({
      pathname: `project/${name}`,
      query: {
        _id: id,
      },
    }))
  }

  return (
    <div style={bodyStyle}>
      <FileSystem toDetail={handleToDetail} dispatch={dispatch} />
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
