import React from 'react'
import { connect } from 'dva'
import { Button, Icon } from 'antd'
import styles from './index.css'
import MyCard from '../../components/MyCard'

function DataImport({ location }) {
  return (
    <div>
      <div className={styles.head}>
        Start your trip!
      </div>
      <div className={styles.container}>
        <MyCard icon='cloud-upload' text='Upload new files'
                style={{ marginRight: 58 }}/>
        <MyCard icon='switcher' text='Choose from existing'
                style={{ marginRight: 58 }}/>
      </div>
    </div>
  )
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps)(DataImport)