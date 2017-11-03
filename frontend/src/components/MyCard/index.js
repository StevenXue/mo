import React from 'react'
import { Icon } from 'antd'
import styles from './index.less'

function MyCard({ icon, text, style, onClick, type }) {
  // if(type == '')

  return (
    <div className={styles.box} style={style} onClick={onClick} >
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
