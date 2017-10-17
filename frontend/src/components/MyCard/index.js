import React from 'react'
import { Icon } from 'antd'
import styles from './index.less'

function MyCard({ icon, text }) {

  return (
    <div className={styles.box}>
      <Icon
        type={icon}
        className={styles.anticon}
      />
      <div className={styles.description}>
        {text}
      </div>
    </div>
  )
}

export default MyCard
