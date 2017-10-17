import React from 'react'
import { connect } from 'dva'
import { Button, Icon } from 'antd'
import styles from './index.css'
import MyCard from '../../components/MyCard'

function DataImport({ location }) {
  return (
    <div className="main-container">
      <div className={styles.head}>
        Start your trip!
      </div>
      <div className={styles.container}>
        <MyCard icon='cloud-upload' text='Upload new files'/>
        <MyCard icon='switcher' text='Choose from existing'/>
      </div>

    </div>
  )
}

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps)(DataImport)
