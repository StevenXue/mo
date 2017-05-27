import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { FileSystem } from './components'
import { Router, routerRedux } from 'dva/router'
import styles from './index.less'
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
      query:{
        _id: id
      }
    }))
  }

  return (
    <div style={bodyStyle}>
      <FileSystem toDetail={handleToDetail} />
    </div>
  )
}

Dashboard.propTypes = {
  dashboard: PropTypes.object,
}

export default connect(({ dashboard }) => ({ dashboard }))(Dashboard)
