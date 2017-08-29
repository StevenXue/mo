import { Router, routerRedux } from 'dva/router'
import styles from './index.less'
import { color } from '../../utils'
import PropTypes from 'prop-types'
import { connect } from 'dva';
import FileSystem from './components/FileSystem.js'

const bodyStyle = {
  bodyStyle: {
    height: 432,
    background: '#fff',
  },
}

function Serving ({ dispatch }) {
  return (
    <div style={bodyStyle}>
      <FileSystem dispatch={dispatch}/>
    </div>
  )
}

Serving.propTypes = {
  serving: PropTypes.object,
}

export default connect(({ serving }) => ({ serving }))(Serving)
